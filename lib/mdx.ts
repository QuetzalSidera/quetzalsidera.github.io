/**
 * VitePress-era Markdown compatibility helpers.
 *
 * The source posts intentionally remain unchanged during migration. This layer
 * only adapts old markdown-it / Vue authoring patterns into MDX-safe text.
 */

import fs from 'node:fs'
import path from 'node:path'

const vueScriptSetupRE = /<script\s+setup(?:\s+[^>]*)?>[\s\S]*?<\/script>/gi
const fenceStartRE = /^\s*(```|~~~)/
const markdownFenceStartRE = /^ {0,3}(`{3,}|~{3,})(.*)$/
const mathFenceRE = /^\s*(?:>\s*)?\$\$\s*$/
const headingAnchorRE = /<a\s+id="[^"]+"\s*><\/a>/g
const headingWithLegacyIdRE = /^(\s{0,3}#{1,6}\s+.*?)(?:\s*\{#([^}]+)\}|<a\s+id=["']?([^"'\s>]+)["']?\s*><\/a>)\s*$/
const singleLineDisplayMathRE = /^(\s*)\$\$\s*(\S(?:[\s\S]*?\S)?)\s*\$\$(\s*)$/
const legacyImageMarkerRE = /@@LEGACY_IMAGE:([^@]+)@@/
const legacyImageMarkerGlobalRE = /@@LEGACY_IMAGE:([^@]+)@@/g
type LegacyImageProps = Record<string, string | boolean | number>
type LegacyMdastNode = {
  type: string
  value?: string
  url?: string
  alt?: string
  title?: string | null
  data?: {
    hName?: string
    hProperties?: Record<string, unknown>
  }
  children?: LegacyMdastNode[]
}
type LegacyMdastRoot = {
  children: LegacyMdastNode[]
}

const pathImportRE = /import\s+\{\s*path\s+as\s+([A-Za-z_$][\w$]*)\s*\}\s+from\s+['"]([^'"]+)['"]/g
const imageConstRE =
  /const\s+([A-Za-z_$][\w$]*)\s*=\s*\{([\s\S]*?)\}\s*as\s+const/g

function isImageSetupFence(info: string): boolean {
  return /(?:^|\s)image-setup(?:\s|$)/.test(info)
}

function isFenceClosingLine(line: string, fenceMarker: string): boolean {
  const markerChar = fenceMarker[0]
  const minLength = fenceMarker.length
  const closeRE = new RegExp(`^ {0,3}\\${markerChar}{${minLength},}\\s*$`)
  return closeRE.test(line)
}

function extractImageSetupFenceBlocks(markdown: string): string[] {
  const lines = markdown.split('\n')
  const blocks: string[] = []

  for (let index = 0; index < lines.length; index += 1) {
    const startMatch = lines[index].match(markdownFenceStartRE)
    if (!startMatch) continue

    const [, marker, info] = startMatch
    if (!isImageSetupFence(info.trim())) continue

    const codeLines: string[] = []
    index += 1

    while (index < lines.length && !isFenceClosingLine(lines[index], marker)) {
      codeLines.push(lines[index])
      index += 1
    }

    blocks.push(codeLines.join('\n'))
  }

  return blocks
}

function stripImageSetupFenceBlocks(markdown: string): string {
  const lines = markdown.split('\n')
  const stripped: string[] = []

  for (let index = 0; index < lines.length; index += 1) {
    const startMatch = lines[index].match(markdownFenceStartRE)
    if (!startMatch) {
      stripped.push(lines[index])
      continue
    }

    const [, marker, info] = startMatch
    if (!isImageSetupFence(info.trim())) {
      stripped.push(lines[index])
      continue
    }

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

function loadLegacyPathMap(importPath: string): Record<string, string> {
  const publicImageMatch = importPath.match(/^@public\/Image\/(.+)\/path$/)
  if (publicImageMatch) {
    return loadJsonPathMap(`/Image/${publicImageMatch[1]}/path.json`)
  }

  return {}
}

function loadJsonPathMap(pathname: string): Record<string, string> {
  try {
    const filePath = path.join(process.cwd(), 'public', pathname)
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Record<string, string>
  } catch {
    return {}
  }
}

function parseLegacyValue(rawValue: string, pathMaps: Record<string, Record<string, string>>) {
  const value = rawValue.trim().replace(/,$/, '')
  const stringMatch = value.match(/^['"]([\s\S]*?)['"]$/)
  if (stringMatch) {
    return stringMatch[1]
  }

  if (value === 'true') return true
  if (value === 'false') return false

  const numberValue = Number(value)
  if (!Number.isNaN(numberValue) && value !== '') {
    return numberValue
  }

  const pathBracketMatch = value.match(/^([A-Za-z_$][\w$]*)\[['"](.+)['"]\]$/)
  if (pathBracketMatch) {
    return pathMaps[pathBracketMatch[1]]?.[pathBracketMatch[2]]
  }

  const pathDotMatch = value.match(/^([A-Za-z_$][\w$]*)\.([A-Za-z_$][\w$-]*)$/)
  if (pathDotMatch) {
    return pathMaps[pathDotMatch[1]]?.[pathDotMatch[2]]
  }

  return undefined
}

function parseLegacyImages(markdown: string): Record<string, LegacyImageProps> {
  const scripts = [
    ...(markdown.match(vueScriptSetupRE) ?? []),
    ...extractImageSetupFenceBlocks(markdown),
  ]
  const images: Record<string, LegacyImageProps> = {}

  for (const script of scripts) {
    const pathMaps: Record<string, Record<string, string>> = {}

    for (const match of script.matchAll(pathImportRE)) {
      pathMaps[match[1]] = loadLegacyPathMap(match[2])
    }

    for (const match of script.matchAll(imageConstRE)) {
      const [, name, body] = match
      const props: LegacyImageProps = {}

      for (const propMatch of body.matchAll(/([A-Za-z_$][\w$]*)\s*:\s*([^,\n]+),?/g)) {
        const value = parseLegacyValue(propMatch[2], pathMaps)
        if (value !== undefined) {
          props[propMatch[1]] = value
        }
      }

      if (Object.keys(props).length) {
        images[name] = props
      }
    }
  }

  return images
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function encodeLegacyImageProps(props: LegacyImageProps): string {
  return Buffer.from(JSON.stringify(props)).toString('base64url')
}

function decodeLegacyImageProps(value: string): LegacyImageProps | null {
  try {
    const decoded = JSON.parse(Buffer.from(value, 'base64url').toString('utf-8')) as LegacyImageProps
    return decoded && typeof decoded === 'object' ? decoded : null
  } catch {
    return null
  }
}

function serializeLegacyImageMarker(props: LegacyImageProps): string {
  return `@@LEGACY_IMAGE:${encodeLegacyImageProps(props)}@@`
}

function serializeLegacyImageMissing(message: string): string {
  return `@@LEGACY_IMAGE:${encodeLegacyImageProps({ legacyMissing: message })}@@`
}

function legacyImageToNode(props: LegacyImageProps): LegacyMdastNode {
  if (!props.src || typeof props.src !== 'string') {
    return {
      type: 'paragraph',
      data: {
        hName: 'span',
        hProperties: { className: ['legacy-image-missing'] },
      },
      children: [
        {
          type: 'text',
          value: typeof props.legacyMissing === 'string' ? props.legacyMissing : '图片引用暂未迁移',
        },
      ],
    }
  }

  const align = typeof props.align === 'string' ? props.align : 'center'
  const wrap = props.wrap === true
  const className = [
    'legacy-image-block',
    `legacy-image-block--${align}`,
    wrap ? 'legacy-image-block--wrap' : 'legacy-image-block--standalone',
  ].join(' ')
  const alt = typeof props.alt === 'string' ? props.alt : typeof props.caption === 'string' ? props.caption : ''
  const maxHeight =
    typeof props.maxHeight === 'number'
      ? `${props.maxHeight}px`
      : typeof props.maxHeight === 'string'
        ? props.maxHeight
        : '32rem'
  const children: LegacyMdastNode[] = [
    {
      type: 'image',
      url: props.src,
      alt,
      title: null,
      data: {
        hProperties: {
          loading: 'lazy',
          style: `max-height:${escapeHtmlAttribute(maxHeight)}`,
        },
      },
    },
  ]

  if (typeof props.caption === 'string' && props.caption) {
    const captionChildren =
      typeof props.captionLink === 'string' && props.captionLink
        ? [
            {
              type: 'link' as const,
              url: props.captionLink,
              title: null,
              data: {
                hProperties: {
                  target: '_blank',
                  rel: ['noopener', 'noreferrer'],
                },
              },
              children: [{ type: 'text' as const, value: props.caption }],
            },
          ]
        : [{ type: 'text' as const, value: props.caption }]

    children.push({
      type: 'paragraph',
      data: {
        hName: 'figcaption',
      },
      children: captionChildren,
    })
  }

  return {
    type: 'paragraph',
    data: {
      hName: 'figure',
      hProperties: {
        className: className.split(' '),
      },
    },
    children,
  }
}

function parseImageAttributeValue(rawValue: string): string | boolean | number {
  const value = rawValue.trim()
  if (value.startsWith('{') && value.endsWith('}')) {
    const innerValue = value.slice(1, -1).trim()
    if (innerValue === 'true') return true
    if (innerValue === 'false') return false
    const numberValue = Number(innerValue)
    return Number.isNaN(numberValue) ? innerValue : numberValue
  }

  const quoted = value.match(/^['"]([\s\S]*?)['"]$/)
  if (quoted) {
    const innerValue = quoted[1]
    if (innerValue === 'true') return true
    if (innerValue === 'false') return false
    return innerValue
  }

  return value
}

function parseImageAttributes(attributeText: string): LegacyImageProps {
  const props: LegacyImageProps = {}

  for (const match of attributeText.matchAll(/(?:^|\s)(:?[A-Za-z][\w-]*)=("[^"]*"|'[^']*'|\{[^}]*\})/g)) {
    props[match[1].replace(/^:/, '')] = parseImageAttributeValue(match[2])
  }

  return props
}

function legacyImageTagToHtml(
  imageTag: string,
  legacyImages: Record<string, LegacyImageProps>,
): string {
  const attributeText = imageTag
    .replace(/^<Image\s*/i, '')
    .replace(/\/>\s*$/, '')
    .replace(/src="\/Imgs\/operating-sys\/cover\.png"/g, 'src="/Image/Miscellaneous/operating-sys/cover.webp"')
  const bindMatch =
    attributeText.match(/\{\s*\.\.\.\s*([A-Za-z_$][\w$]*)\s*\}/)

  if (bindMatch) {
    const props = legacyImages[bindMatch[1]]
    return props
      ? serializeLegacyImageMarker(props)
      : serializeLegacyImageMissing(`图片引用 "${bindMatch[1]}" 暂未迁移`)
  }

  const vueBindMatch = attributeText.match(/v-bind="([^"]+)"/)
  if (vueBindMatch) {
    return serializeLegacyImageMissing(`图片引用 "${vueBindMatch[1]}" 仍在使用 Vue v-bind 语法，请改为 React spread 语法`)
  }

  return serializeLegacyImageMarker(parseImageAttributes(attributeText))
}

function normalizeLegacyBlockquoteMath(lines: string[]): string[] {
  let inBlockquoteMath = false
  let quotePrefix = '>'

  return lines.map((line) => {
    if (!inBlockquoteMath) {
      const start = line.match(/^(\s*)>\s*\$\$\s*$/)
      if (start) {
        inBlockquoteMath = true
        quotePrefix = `${start[1]}>`
      }
      return line
    }

    if (/^\s*>\s*\$\$\s*$/.test(line)) {
      inBlockquoteMath = false
      return line
    }

    const quotedLine = line.match(/^\s*>\s?(.*)$/)
    if (quotedLine) {
      return quotedLine[1] ? `${quotePrefix} ${quotedLine[1]}` : quotePrefix
    }

    return line.trim() ? `${quotePrefix} ${line.trimStart()}` : quotePrefix
  })
}

function withMathPrefix(line: string, prefix: string): string {
  if (!prefix.includes('>')) {
    return `${prefix}${line.trimStart()}`
  }

  return `${prefix}${line.replace(/^\s*>\s?/, '').trimStart()}`
}

function normalizeDisplayMathDelimiters(lines: string[]): string[] {
  const normalized: string[] = []
  let inFence = false
  let fenceMarker: string | null = null
  let inDisplayMath = false
  let displayMathPrefix = ''

  for (const line of lines) {
    const fenceMatch = line.match(fenceStartRE)
    if (fenceMatch) {
      const marker = fenceMatch[1]
      if (!inFence) {
        inFence = true
        fenceMarker = marker
      } else if (marker === fenceMarker) {
        inFence = false
        fenceMarker = null
      }
      normalized.push(line)
      continue
    }

    if (inFence) {
      normalized.push(line)
      continue
    }

    if (inDisplayMath) {
      const endMatch = line.match(/^(.*?)\s*\$\$\s*$/)
      if (endMatch && !mathFenceRE.test(line)) {
        if (endMatch[1].trim()) {
          normalized.push(withMathPrefix(endMatch[1], displayMathPrefix))
        }
        normalized.push(`${displayMathPrefix}$$`)
        inDisplayMath = false
        displayMathPrefix = ''
        continue
      }

      normalized.push(line)
      continue
    }

    const startMatch = line.match(/^(\s*(?:>\s*)?)\$\$(.*)$/)
    if (!startMatch || !startMatch[2].trim()) {
      normalized.push(line)
      continue
    }

    const [, prefix, rest] = startMatch
    const singleLineMatch = rest.match(/^(.*?)\s*\$\$\s*$/)
    normalized.push(`${prefix}$$`)
    if (singleLineMatch) {
      if (singleLineMatch[1].trim()) {
        normalized.push(withMathPrefix(singleLineMatch[1], prefix))
      }
      normalized.push(`${prefix}$$`)
      continue
    }

    normalized.push(withMathPrefix(rest, prefix))
    inDisplayMath = true
    displayMathPrefix = prefix
  }

  return normalized
}

function escapeLiteralHtmlTags(line: string): string {
  const anchors: string[] = []

  return line
    .replace(headingAnchorRE, (anchor) => {
      anchors.push(anchor)
      return `@@ANCHOR_${anchors.length - 1}@@`
    })
    .replace(/<\/?([a-z][a-z0-9-]*)(?:\s[^>]*)?>/g, (tag) =>
      tag.replace(/</g, '&lt;').replace(/>/g, '&gt;'),
    )
    .replace(/@@ANCHOR_(\d+)@@/g, (_, index: string) => anchors[Number(index)])
}

function normalizeLegacyLatex(line: string): string {
  return line.replace(/\\boldsymbol\{\\\$\}/g, '\\boldsymbol{\\text{\\textdollar}}')
}

function normalizeMathLine(line: string): string {
  return normalizeLegacyLatex(line)
}

function normalizeNonCodeLine(line: string, legacyImages: Record<string, LegacyImageProps>): string {
  const legacyImageHtml: string[] = []
  const normalized = normalizeLegacyLatex(line)
    .replace(/<a\s+id=([^"'\s>]+)\s*><\/a>/g, '<a id="$1"></a>')
    .replace(/(\s):([A-Za-z][\w-]*)="(true|false)"/g, '$1$2={$3}')
    .replace(/^(\s*):([A-Za-z][\w-]*)="(true|false)"\s*$/, '$1$2={$3}')
    .replace(/src="\/Imgs\/operating-sys\/cover\.png"/g, 'src="/Image/Miscellaneous/operating-sys/cover.webp"')
    .replace(/<Image\b[\s\S]*?\/>/g, (imageTag: string) => {
      const index = legacyImageHtml.push(legacyImageTagToHtml(imageTag, legacyImages)) - 1
      return `@@LEGACY_IMAGE_${index}@@`
    })

  return escapeLiteralHtmlTags(normalized).replace(/@@LEGACY_IMAGE_(\d+)@@/g, (_, index: string) => {
    return legacyImageHtml[Number(index)] ?? ''
  })
}

function normalizeHeadingLine(line: string): string | null {
  const match = line.match(headingWithLegacyIdRE)
  if (!match) return null

  const [, heading, braceId, anchorId] = match
  return `${heading} {#${braceId ?? anchorId}}`
}

function normalizeSingleLineDisplayMath(line: string): string[] | null {
  const match = line.match(singleLineDisplayMathRE)
  if (!match) return null

  const [, indent, math, trailing] = match
  return [`${indent}$$`, `${indent}${normalizeMathLine(math)}`, `${indent}$$${trailing}`]
}

export function toMdxSource(markdown: string): string {
  const legacyImages = parseLegacyImages(markdown)
  const withoutImageSetupFences = stripImageSetupFenceBlocks(markdown)
  const withoutVueScripts = withoutImageSetupFences.replace(vueScriptSetupRE, '')
  const lines = normalizeDisplayMathDelimiters(normalizeLegacyBlockquoteMath(withoutVueScripts.split('\n')))
  let inFence = false
  let fenceMarker: string | null = null
  let inMathBlock = false
  let pendingImageLines: string[] | null = null

  return lines
    .map((line) => {
      const fenceMatch = line.match(fenceStartRE)
      if (fenceMatch) {
        const marker = fenceMatch[1]
        if (!inFence) {
          inFence = true
          fenceMarker = marker
        } else if (marker === fenceMarker) {
          inFence = false
          fenceMarker = null
        }
        return line
      }

      if (inFence) {
        return line
      }

      if (pendingImageLines) {
        pendingImageLines.push(line)
        if (/\/>\s*$/.test(line)) {
          const imageTag = pendingImageLines.join(' ')
          pendingImageLines = null
          return legacyImageTagToHtml(imageTag, legacyImages)
        }

        return ''
      }

      if (mathFenceRE.test(line)) {
        inMathBlock = !inMathBlock
        return line
      }

      if (inMathBlock) {
        return normalizeMathLine(line)
      }

      const singleLineMath = normalizeSingleLineDisplayMath(line)
      if (singleLineMath) {
        return singleLineMath.join('\n')
      }

      if (/<Image\b/.test(line) && !/\/>\s*$/.test(line)) {
        pendingImageLines = [line]
        return ''
      }

      const headingLine = normalizeHeadingLine(line)
      return headingLine ?? normalizeNonCodeLine(line, legacyImages)
    })
    .join('\n')
}

function hasParagraphContent(children: LegacyMdastNode[]) {
  return children.some((child) => child.type !== 'text' || child.value?.trim())
}

function flushParagraph(template: LegacyMdastNode, children: LegacyMdastNode[], nodes: LegacyMdastNode[]) {
  if (!hasParagraphContent(children)) return

  nodes.push({
    ...template,
    children,
  })
}

function splitParagraphLegacyImages(paragraph: LegacyMdastNode): LegacyMdastNode[] {
  if (!paragraph.children?.some((child) => child.type === 'text' && legacyImageMarkerRE.test(child.value ?? ''))) {
    return [paragraph]
  }

  const nodes: LegacyMdastNode[] = []
  let paragraphChildren: LegacyMdastNode[] = []

  for (const child of paragraph.children) {
    if (child.type !== 'text' || !child.value) {
      paragraphChildren.push(child)
      continue
    }

    let lastIndex = 0
    for (const marker of child.value.matchAll(legacyImageMarkerGlobalRE)) {
      const markerStart = marker.index ?? 0
      const before = child.value.slice(lastIndex, markerStart)

      if (before) {
        paragraphChildren.push({ ...child, value: before })
      }

      flushParagraph(paragraph, paragraphChildren, nodes)
      paragraphChildren = []

      const props = decodeLegacyImageProps(marker[1])
      nodes.push(props ? legacyImageToNode(props) : legacyImageToNode({}))
      lastIndex = markerStart + marker[0].length
    }

    const after = child.value.slice(lastIndex)
    if (after) {
      paragraphChildren.push({ ...child, value: after })
    }
  }

  flushParagraph(paragraph, paragraphChildren, nodes)
  return nodes
}

function replaceLegacyImageMarkers(parent: { children?: LegacyMdastNode[] }) {
  if (!parent.children) return

  parent.children = parent.children.flatMap((child) => {
    if (child.type === 'paragraph') {
      return splitParagraphLegacyImages(child)
    }

    if ('children' in child) {
      replaceLegacyImageMarkers(child)
    }

    return [child]
  })
}

function collectPlainText(node: LegacyMdastNode): string {
  if (node.type === 'text') {
    return node.value ?? ''
  }

  return node.children?.map(collectPlainText).join('') ?? ''
}

function getTextChildValue(node: LegacyMdastNode | undefined): string {
  if (!node) return ''
  return node.type === 'text' ? (node.value ?? '') : ''
}

function slugifyHeading(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g, '')
}

function addHeadingAnchors(parent: { children?: LegacyMdastNode[] }) {
  if (!parent.children) return

  for (const child of parent.children) {
    if (/^heading$/i.test(child.type)) {
      let explicitId: string | undefined
      const children = [...(child.children ?? [])]
      const lastChild = children[children.length - 1]
      const lastText = getTextChildValue(lastChild)
      const idMatch = lastText.match(/\s*\{#([^}]+)\}\s*$/)

      if (idMatch) {
        explicitId = idMatch[1]
        const nextValue = lastText.slice(0, idMatch.index).trimEnd()
        if (nextValue) {
          lastChild.value = nextValue
          child.children = children
        } else {
          child.children = children.slice(0, -1)
        }
      }

      const id =
        explicitId ??
        (typeof child.data?.hProperties?.id === 'string'
          ? child.data.hProperties.id
          : slugifyHeading(collectPlainText(child)))

      child.data = {
        ...child.data,
        hProperties: {
          ...child.data?.hProperties,
          id,
        },
      }
      child.children = [
        {
          type: 'link',
          url: `#${id}`,
          title: null,
          data: {
            hProperties: {
              className: ['header-anchor'],
              ariaLabel: `Permalink to "${collectPlainText(child)}"`,
            },
          },
          children: [],
        },
        ...(child.children ?? []),
      ]
      continue
    }

    if ('children' in child) {
      addHeadingAnchors(child)
    }
  }
}

export function remarkLegacyImages() {
  return (tree: LegacyMdastRoot) => {
    replaceLegacyImageMarkers(tree)
    addHeadingAnchors(tree)
  }
}
