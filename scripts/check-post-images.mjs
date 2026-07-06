import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const repoRoot = process.cwd()
const postsDir = path.join(repoRoot, 'posts')
const vueScriptSetupRE = /<script\s+setup(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi
const markdownFenceStartRE = /^ {0,3}(`{3,}|~{3,})(.*)$/
const imageBindRE =
  /<Image\b[\s\S]*?\{\s*\.\.\.\s*([A-Za-z_$][\w$]*)\s*\}[\s\S]*?\/>/g
const vueImageBindRE = /<Image\b[\s\S]*?\bv-bind="([^"]+)"[\s\S]*?\/>/g
const imageConstRE = /const\s+([A-Za-z_$][\w$]*)\s*=\s*\{([\s\S]*?)\}\s*as\s+const/g

function isImageSetupFence(info) {
  return /(?:^|\s)image-setup(?:\s|$)/.test(info)
}

function isFenceClosingLine(line, fenceMarker) {
  const markerChar = fenceMarker[0]
  const minLength = fenceMarker.length
  const closeRE = new RegExp(`^ {0,3}\\${markerChar}{${minLength},}\\s*$`)
  return closeRE.test(line)
}

function extractImageSetupFenceBlocks(markdown) {
  const lines = markdown.split('\n')
  const blocks = []

  for (let index = 0; index < lines.length; index += 1) {
    const startMatch = lines[index].match(markdownFenceStartRE)
    if (!startMatch) continue

    const [, marker, info] = startMatch
    if (!isImageSetupFence(info.trim())) continue

    const startLine = index + 1
    const codeLines = []
    index += 1

    while (index < lines.length && !isFenceClosingLine(lines[index], marker)) {
      codeLines.push(lines[index])
      index += 1
    }

    blocks.push({ code: codeLines.join('\n'), line: startLine })
  }

  return blocks
}

function stripMarkdownFenceBlocks(markdown) {
  const lines = markdown.split('\n')
  const stripped = []

  for (let index = 0; index < lines.length; index += 1) {
    const startMatch = lines[index].match(markdownFenceStartRE)
    if (!startMatch) {
      stripped.push(lines[index])
      continue
    }

    const [, marker] = startMatch
    stripped.push('')
    index += 1

    while (index < lines.length && !isFenceClosingLine(lines[index], marker)) {
      stripped.push('')
      index += 1
    }

    if (index < lines.length) {
      stripped.push('')
    }
  }

  return stripped.join('\n')
}

function stripInlineCodeSpans(markdown) {
  return markdown
    .split('\n')
    .map((line) => {
      let result = ''
      let index = 0

      while (index < line.length) {
        if (line[index] !== '`') {
          result += line[index]
          index += 1
          continue
        }

        let markerEnd = index
        while (markerEnd < line.length && line[markerEnd] === '`') {
          markerEnd += 1
        }

        const marker = line.slice(index, markerEnd)
        const closeIndex = line.indexOf(marker, markerEnd)
        if (closeIndex === -1) {
          result += marker
          index = markerEnd
          continue
        }

        result += ' '.repeat(closeIndex + marker.length - index)
        index = closeIndex + marker.length
      }

      return result
    })
    .join('\n')
}

function extractVueScriptSetupBlocks(markdown) {
  return [...markdown.matchAll(vueScriptSetupRE)].map((match) => ({
    code: match[1],
    line: markdown.slice(0, match.index).split('\n').length,
  }))
}

function extractSetupBlocks(markdown) {
  return [
    ...extractVueScriptSetupBlocks(markdown),
    ...extractImageSetupFenceBlocks(markdown),
  ]
}

function collectImageBindings(markdown) {
  return [...stripInlineCodeSpans(stripMarkdownFenceBlocks(markdown)).matchAll(imageBindRE)].map(
    (match) => match[1],
  )
}

function collectVueImageBindings(markdown) {
  return [
    ...stripInlineCodeSpans(stripMarkdownFenceBlocks(markdown)).matchAll(vueImageBindRE),
  ].map((match) => match[1])
}

function collectImageConstNames(code) {
  return [...code.matchAll(imageConstRE)].map((match) => match[1])
}

function fileToModuleName(file) {
  return file.replace(/[^A-Za-z0-9_$]/g, '_')
}

function validatePost(file, markdown) {
  const blocks = extractSetupBlocks(markdown)
  const bindings = collectImageBindings(markdown)
  const vueBindings = collectVueImageBindings(markdown)
  const setupLines = []

  for (const block of blocks) {
    while (setupLines.length < block.line - 1) {
      setupLines.push('')
    }
    setupLines.push(...block.code.split('\n'), '')
  }

  const setupCode = setupLines.join('\n')
  const definedImages = new Set(collectImageConstNames(setupCode))
  const errors = []

  for (const binding of vueBindings) {
    errors.push(`${file}: <Image v-bind="${binding}" /> is Vue syntax; use <Image {...${binding}} />`)
  }

  for (const binding of bindings) {
    if (!definedImages.has(binding)) {
      errors.push(`${file}: <Image {...${binding}} /> has no matching image setup const`)
    }
  }

  for (const imageName of definedImages) {
    const srcRE = new RegExp(`const\\s+${imageName}\\s*=\\s*\\{[\\s\\S]*?\\bsrc\\s*:`, 'm')
    if (!srcRE.test(setupCode)) {
      errors.push(`${file}: image const "${imageName}" is missing a src field`)
    }
  }

  return { blocks, bindings, errors, setupCode }
}

function listMarkdownFiles(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const pathname = path.join(dir, entry.name)
      if (entry.isDirectory()) return listMarkdownFiles(pathname)
      return entry.isFile() && entry.name.endsWith('.md') ? [pathname] : []
    })
}

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'post-image-check-'))
const generatedFiles = []
const validationErrors = []

try {
  for (const pathname of listMarkdownFiles(postsDir)) {
    const relativeFile = path.relative(repoRoot, pathname)
    const markdown = fs.readFileSync(pathname, 'utf-8')
    const { blocks, bindings, errors, setupCode } = validatePost(relativeFile, markdown)

    validationErrors.push(...errors)

    if (!setupCode.trim()) continue

    const moduleName = fileToModuleName(relativeFile)
    const assertions = bindings
      .map((binding) => `void ${binding}.src`)
      .join('\n')
    const generated = [
      `// Generated from ${relativeFile}; do not edit.`,
      `// Source setup lines: ${blocks.map((block) => block.line).join(', ')}`,
      setupCode,
      assertions,
      '',
    ].join('\n')
    const generatedPath = path.join(tempDir, `${moduleName}.ts`)

    fs.writeFileSync(generatedPath, generated)
    generatedFiles.push(generatedPath)
  }

  if (validationErrors.length) {
    console.error(validationErrors.join('\n'))
    process.exit(1)
  }

  if (!generatedFiles.length) {
    process.exit(0)
  }

  const configPath = path.join(tempDir, 'tsconfig.json')
  fs.writeFileSync(
    configPath,
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          lib: ['esnext'],
          strict: true,
          noEmit: true,
          module: 'esnext',
          moduleResolution: 'bundler',
          baseUrl: repoRoot,
          paths: {
            '@public/*': ['./public/*'],
          },
          skipLibCheck: true,
        },
        files: generatedFiles,
      },
      null,
      2,
    ),
  )

  execFileSync(
    path.join(repoRoot, 'node_modules/.bin/tsc'),
    ['--pretty', 'false', '-p', configPath],
    { stdio: 'inherit' },
  )
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true })
}
