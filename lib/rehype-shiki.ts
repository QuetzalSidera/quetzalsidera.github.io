import { codeToTokens, bundledLanguages, type BundledLanguage } from 'shiki'

type HastText = {
  type: 'text'
  value: string
}

type HastElement = {
  type: 'element'
  tagName: string
  properties: Record<string, unknown>
  children: HastNode[]
}

type HastRoot = {
  type: 'root'
  children: HastNode[]
}

type HastNode = HastText | HastElement

const defaultLanguage = 'text'
const theme = 'solarized-dark'

function isElement(node: HastNode | HastRoot): node is HastElement {
  return node.type === 'element'
}

function isText(node: HastNode): node is HastText {
  return node.type === 'text'
}

function getClassNames(node: HastElement) {
  const className = node.properties.className

  if (Array.isArray(className)) {
    return className.map(String)
  }

  if (typeof className === 'string') {
    return className.split(/\s+/).filter(Boolean)
  }

  return []
}

function setClassNames(node: HastElement, classNames: string[]) {
  node.properties.className = [...new Set(classNames)]
}

function getLanguage(node: HastElement) {
  const languageClass = getClassNames(node).find((className) => className.startsWith('language-'))
  const language = languageClass?.replace(/^language-/, '').toLowerCase() || defaultLanguage

  return language in bundledLanguages ? (language as BundledLanguage) : defaultLanguage
}

function getTextContent(node: HastElement): string {
  return node.children.map((child) => (isText(child) ? child.value : '')).join('')
}

function tokenStyle(token: { color?: string; fontStyle?: number }) {
  const styles: string[] = []

  if (token.color) {
    styles.push(`color:${token.color}`)
  }

  if (token.fontStyle) {
    if (token.fontStyle & 1) styles.push('font-style:italic')
    if (token.fontStyle & 2) styles.push('font-weight:700')
    if (token.fontStyle & 4) styles.push('text-decoration:underline')
  }

  return styles.join(';')
}

async function highlightCode(codeNode: HastElement) {
  const code = getTextContent(codeNode).replace(/\n$/, '')
  const lang = getLanguage(codeNode)
  const result = await codeToTokens(code, { lang, theme })
  const children: HastNode[] = []

  result.tokens.forEach((line, lineIndex) => {
    const lineChildren: HastNode[] = line.length
      ? line.map((token) => ({
          type: 'element' as const,
          tagName: 'span',
          properties: {
            className: ['shiki-token'],
            style: tokenStyle(token),
          },
          children: [{ type: 'text' as const, value: token.content }],
        }))
      : [{ type: 'text' as const, value: '' }]

    children.push({
      type: 'element',
      tagName: 'span',
      properties: { className: ['line'] },
      children: lineChildren,
    })

    if (lineIndex < result.tokens.length - 1) {
      children.push({ type: 'text', value: '\n' })
    }
  })

  codeNode.children = children
  setClassNames(codeNode, [...getClassNames(codeNode), 'shiki'])
}

async function visit(node: HastRoot | HastElement) {
  for (const child of node.children) {
    if (!isElement(child)) {
      continue
    }

    if (child.tagName === 'pre') {
      const codeNode = child.children.find(
        (preChild): preChild is HastElement => isElement(preChild) && preChild.tagName === 'code',
      )

      if (codeNode) {
        await highlightCode(codeNode)
      }

      continue
    }

    await visit(child)
  }
}

export function rehypeShiki() {
  return async (tree: HastRoot) => {
    await visit(tree)
  }
}
