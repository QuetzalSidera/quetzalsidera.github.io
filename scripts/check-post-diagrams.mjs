import { readFile, readdir } from 'node:fs/promises'
import { relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import process from 'node:process'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkDirective from 'remark-directive'
import { remarkContentDirectives } from '../lib/remark-content-directives.ts'

function collectDiagrams(tree) {
  const diagrams = []

  function visit(node) {
    if (node.data?.hName === 'Diagram') {
      diagrams.push({
        source: node.data.hProperties?.source ?? '',
        line: node.position?.start?.line ?? 1,
      })
    }

    for (const child of node.children ?? []) visit(child)
  }

  visit(tree)
  return diagrams
}

function parseDiagrams(file, source) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(remarkContentDirectives)
  const tree = processor.parse(source)
  const transformed = processor.runSync(tree, { path: file })
  return collectDiagrams(transformed)
}

function formatError(file, line, error) {
  const message = String(error?.reason ?? error?.str ?? error?.message ?? error)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 240)
  return `${relative(process.cwd(), file)}:${line}: ${message}`
}

let parserPromise

async function getMermaidParser() {
  if (parserPromise) return parserPromise

  parserPromise = (async () => {
    const { JSDOM } = await import('jsdom')
    const dom = new JSDOM('<!doctype html><html><body></body></html>')

    for (const name of [
      'window',
      'document',
      'HTMLElement',
      'SVGElement',
      'Element',
      'Node',
    ]) {
      Object.defineProperty(globalThis, name, {
        configurable: true,
        value: dom.window[name],
      })
    }

    const { default: mermaid } = await import('mermaid')
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      htmlLabels: false,
      suppressErrorRendering: true,
    })
    return mermaid
  })()

  return parserPromise
}

export async function validateFiles(files) {
  const diagrams = []
  const errors = []

  for (const file of files) {
    try {
      const source = await readFile(file, 'utf8')
      for (const diagram of parseDiagrams(file, source)) {
        diagrams.push({ ...diagram, file })
      }
    } catch (error) {
      const line = error?.line ?? error?.place?.start?.line ?? 1
      errors.push(formatError(file, line, error))
    }
  }

  if (!diagrams.length) return errors

  const mermaid = await getMermaidParser()
  for (const diagram of diagrams) {
    try {
      await mermaid.parse(diagram.source)
    } catch (error) {
      errors.push(formatError(diagram.file, diagram.line, error))
    }
  }

  return errors
}

async function listMarkdownFiles(directory) {
  const result = []

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const pathname = resolve(directory, entry.name)
    if (entry.isDirectory()) result.push(...await listMarkdownFiles(pathname))
    else if (entry.isFile() && entry.name.endsWith('.md')) result.push(pathname)
  }

  return result
}

async function main() {
  const root = resolve(process.argv[2] ?? 'posts')

  try {
    const files = (await listMarkdownFiles(root)).sort()
    const errors = await validateFiles(files)
    if (errors.length) {
      console.error(errors.join('\n'))
      process.exitCode = 1
    }
  } catch (error) {
    console.error(`Mermaid validation unavailable: ${error?.message ?? error}`)
    process.exitCode = 1
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main()
}
