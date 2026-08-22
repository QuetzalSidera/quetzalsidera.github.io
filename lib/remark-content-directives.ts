import { toMarkdown } from 'mdast-util-to-markdown'

type AstPoint = {
  line?: number
  column?: number
  offset?: number
}

type AstPosition = {
  start?: AstPoint
  end?: AstPoint
}

type AstData = {
  hName?: string
  hProperties?: Record<string, unknown>
  [key: string]: unknown
}

type AstNode = {
  type: string
  name?: string
  value?: string
  alt?: string
  start?: number | null
  attributes?: Record<string, string | null | undefined> | null
  children?: AstNode[]
  data?: AstData
  position?: AstPosition
}

type AstRoot = AstNode & {
  type: 'root'
  children: AstNode[]
}

type VFileLike = {
  fail(reason: string, ...details: unknown[]): never
}

type ComponentName =
  | 'ContentFlow'
  | 'FlowMedia'
  | 'FlowBody'
  | 'ImageGroup'
  | 'GroupCaption'
  | 'MindMap'
  | 'ExerciseSet'
  | 'ExerciseGroup'
  | 'Exercise'
  | 'ExerciseStem'
  | 'ExerciseParts'
  | 'ExerciseChoices'
  | 'ExerciseAnswer'
  | 'ExerciseSolution'
  | 'ExerciseHint'

const origin = 'remark-content-directives'
const directiveNodeTypes = new Set(['containerDirective', 'leafDirective', 'textDirective'])

const globalComponents: Record<string, ComponentName> = {
  flow: 'ContentFlow',
  'image-group': 'ImageGroup',
  mindmap: 'MindMap',
  'exercise-set': 'ExerciseSet',
  'exercise-group': 'ExerciseGroup',
  exercise: 'Exercise',
}

const requiredParents: Partial<Record<string, string>> = {
  'exercise-group': 'exercise-set',
  exercise: 'exercise-group',
}

const scopedComponents: Record<
  string,
  { component: ComponentName; parent: string }
> = {
  media: { component: 'FlowMedia', parent: 'flow' },
  body: { component: 'FlowBody', parent: 'flow' },
  caption: { component: 'GroupCaption', parent: 'image-group' },
  stem: { component: 'ExerciseStem', parent: 'exercise' },
  parts: { component: 'ExerciseParts', parent: 'exercise' },
  choices: { component: 'ExerciseChoices', parent: 'exercise' },
  answer: { component: 'ExerciseAnswer', parent: 'exercise' },
  solution: { component: 'ExerciseSolution', parent: 'exercise' },
  hint: { component: 'ExerciseHint', parent: 'exercise' },
}

const attributeNames: Record<string, string> = {
  'media-width': 'mediaWidth',
  'min-text-width': 'minTextWidth',
  'mobile-columns': 'mobileColumns',
  'print-columns': 'printColumns',
  'print-height': 'printHeight',
  'choice-columns': 'choiceColumns',
  'answer-lines': 'answerLines',
  'keep-together': 'keepTogether',
  'break-before': 'breakBefore',
  class: 'className',
}

const flowModes = new Set(['block', 'float', 'split'])
const flowSides = new Set(['left', 'right'])
const flowPrintModes = new Set(['block', 'preserve'])
const exerciseFonts = new Set(['kai', 'song', 'site'])
const exerciseTypes = new Set([
  'single',
  'multiple',
  'judge',
  'fill',
  'short',
  'calculation',
  'proof',
])

function isDirective(node: AstNode): boolean {
  return directiveNodeTypes.has(node.type) && typeof node.name === 'string'
}

function fail(file: VFileLike, node: AstNode, message: string): never {
  return file.fail(message, node, origin)
}

function resolveComponent(
  node: AstNode,
  parent: AstNode | undefined,
  file: VFileLike,
): ComponentName | undefined {
  if (!isDirective(node)) return undefined

  const name = node.name as string
  const globalComponent = globalComponents[name]
  if (globalComponent) {
    const requiredParent = requiredParents[name]
    if (requiredParent && (!parent || !isDirective(parent) || parent.name !== requiredParent)) {
      fail(file, node, `Directive \`:${name}\` must be a direct child of \`:${requiredParent}\``)
    }
    return globalComponent
  }

  const scopedComponent = scopedComponents[name]
  if (!scopedComponent) return undefined

  if (!parent || !isDirective(parent) || parent.name !== scopedComponent.parent) {
    fail(file, node, `Directive \`:${name}\` must be a direct child of \`:${scopedComponent.parent}\``)
  }

  return scopedComponent.component
}

function collectComponents(
  node: AstNode,
  file: VFileLike,
  components: WeakMap<AstNode, ComponentName>,
  parent?: AstNode,
) {
  const component = resolveComponent(node, parent, file)
  if (component) {
    components.set(node, component)
  }

  for (const child of node.children ?? []) {
    collectComponents(child, file, components, node)
  }
}

function assertDirectChildren(
  node: AstNode,
  allowed: ReadonlySet<ComponentName>,
  components: WeakMap<AstNode, ComponentName>,
  file: VFileLike,
) {
  for (const child of node.children ?? []) {
    const childComponent = components.get(child)
    if (!childComponent || !allowed.has(childComponent)) {
      fail(
        file,
        child,
        `\`:${node.name}\` only accepts ${[...allowed].map((name) => `\`${name}\``).join(', ')} as direct children`,
      )
    }
  }
}

function countDirectChildren(
  node: AstNode,
  component: ComponentName,
  components: WeakMap<AstNode, ComponentName>,
) {
  return (node.children ?? []).filter((child) => components.get(child) === component).length
}

function assertChildCount(
  node: AstNode,
  component: ComponentName,
  expected: number,
  components: WeakMap<AstNode, ComponentName>,
  file: VFileLike,
) {
  const count = countDirectChildren(node, component, components)
  if (count !== expected) {
    fail(file, node, `\`:${node.name}\` requires exactly ${expected} direct \`${component}\` child`)
  }
}

function assertAtMostOneChild(
  node: AstNode,
  component: ComponentName,
  components: WeakMap<AstNode, ComponentName>,
  file: VFileLike,
) {
  if (countDirectChildren(node, component, components) > 1) {
    fail(file, node, `\`:${node.name}\` accepts at most one direct \`${component}\` child`)
  }
}

function getAttribute(node: AstNode, name: string): string | undefined {
  const value = node.attributes?.[name]
  return value === null || value === undefined ? undefined : value
}

function validateEnum(
  node: AstNode,
  attribute: string,
  allowed: ReadonlySet<string>,
  file: VFileLike,
) {
  const value = getAttribute(node, attribute)
  if (value !== undefined && !allowed.has(value)) {
    fail(
      file,
      node,
      `Attribute \`${attribute}\` on \`:${node.name}\` must be one of ${[...allowed].join(', ')}`,
    )
  }
}

function validateInteger(
  node: AstNode,
  attribute: string,
  minimum: number,
  maximum: number | undefined,
  file: VFileLike,
) {
  const value = getAttribute(node, attribute)
  if (value === undefined) return

  const number = Number(value)
  if (
    !Number.isInteger(number) ||
    number < minimum ||
    (maximum !== undefined && number > maximum)
  ) {
    const range = maximum === undefined ? `an integer >= ${minimum}` : `an integer from ${minimum} to ${maximum}`
    fail(file, node, `Attribute \`${attribute}\` on \`:${node.name}\` must be ${range}`)
  }
}

function parseBoolean(
  node: AstNode,
  attribute: string,
  file: VFileLike,
): 'true' | 'false' | undefined {
  const value = getAttribute(node, attribute)
  if (value === undefined) return undefined
  if (value === '' || value === 'true') return 'true'
  if (value === 'false') return 'false'

  fail(file, node, `Attribute \`${attribute}\` on \`:${node.name}\` must be true or false`)
}

function validateAttributes(node: AstNode, component: ComponentName, file: VFileLike) {
  if (component === 'ContentFlow') {
    validateEnum(node, 'mode', flowModes, file)
    validateEnum(node, 'side', flowSides, file)
    validateEnum(node, 'print', flowPrintModes, file)
  }

  if (component === 'ImageGroup') {
    validateInteger(node, 'columns', 1, 4, file)
    validateInteger(node, 'mobile-columns', 1, 4, file)
    validateInteger(node, 'print-columns', 1, 4, file)
  }

  if (component === 'ExerciseSet') {
    validateEnum(node, 'font', exerciseFonts, file)
  }

  if (component === 'ExerciseGroup' || component === 'ExerciseParts' || component === 'ExerciseChoices') {
    validateInteger(node, 'start', 1, undefined, file)
  }

  if (component === 'Exercise') {
    validateEnum(node, 'type', exerciseTypes, file)
    validateInteger(node, 'answer-lines', 0, undefined, file)
    parseBoolean(node, 'keep-together', file)
    parseBoolean(node, 'break-before', file)
  }

  if (component === 'ExerciseParts' || component === 'ExerciseChoices') {
    const choiceColumns = getAttribute(node, 'choice-columns')
    if (choiceColumns !== undefined && !['auto', '1', '2', '4'].includes(choiceColumns)) {
      fail(
        file,
        node,
        `Attribute \`choice-columns\` on \`:${node.name}\` must be auto, 1, 2, or 4`,
      )
    }
  }
}

function validateStructure(
  node: AstNode,
  component: ComponentName,
  components: WeakMap<AstNode, ComponentName>,
  file: VFileLike,
) {
  if (component === 'ContentFlow') {
    assertDirectChildren(node, new Set(['FlowMedia', 'FlowBody']), components, file)
    assertChildCount(node, 'FlowMedia', 1, components, file)
    assertChildCount(node, 'FlowBody', 1, components, file)
  }

  if (component === 'ImageGroup') {
    assertAtMostOneChild(node, 'GroupCaption', components, file)
  }

  if (component === 'ExerciseSet') {
    assertDirectChildren(node, new Set(['ExerciseGroup']), components, file)
  }

  if (component === 'ExerciseGroup') {
    assertDirectChildren(node, new Set(['Exercise']), components, file)
  }

  if (component === 'Exercise') {
    assertDirectChildren(
      node,
      new Set([
        'ExerciseStem',
        'ExerciseParts',
        'ExerciseChoices',
        'ExerciseAnswer',
        'ExerciseSolution',
        'ExerciseHint',
      ]),
      components,
      file,
    )
    assertChildCount(node, 'ExerciseStem', 1, components, file)
    assertAtMostOneChild(node, 'ExerciseAnswer', components, file)
    assertAtMostOneChild(node, 'ExerciseSolution', components, file)
    assertAtMostOneChild(node, 'ExerciseHint', components, file)

    const type = getAttribute(node, 'type') ?? 'short'
    if (
      countDirectChildren(node, 'ExerciseChoices', components) > 0 &&
      type !== 'single' &&
      type !== 'multiple'
    ) {
      fail(file, node, '`choices` is only valid on exercises with type `single` or `multiple`')
    }
  }
}

function validateTree(
  node: AstNode,
  file: VFileLike,
  components: WeakMap<AstNode, ComponentName>,
) {
  const component = components.get(node)
  if (component) {
    validateAttributes(node, component, file)
    validateStructure(node, component, components, file)
  }

  for (const child of node.children ?? []) {
    validateTree(child, file, components)
  }
}

function collectPlainText(node: AstNode): string {
  if (typeof node.value === 'string') return node.value
  if (typeof node.alt === 'string') return node.alt
  return (node.children ?? []).map(collectPlainText).join(' ')
}

function isEastAsianWide(codePoint: number): boolean {
  return (
    codePoint >= 0x1100 &&
    (codePoint <= 0x115f ||
      codePoint === 0x2329 ||
      codePoint === 0x232a ||
      (codePoint >= 0x2e80 && codePoint <= 0x303e) ||
      (codePoint >= 0x3040 && codePoint <= 0xa4cf) ||
      (codePoint >= 0xac00 && codePoint <= 0xd7a3) ||
      (codePoint >= 0xf900 && codePoint <= 0xfaff) ||
      (codePoint >= 0xfe10 && codePoint <= 0xfe19) ||
      (codePoint >= 0xfe30 && codePoint <= 0xfe6f) ||
      (codePoint >= 0xff00 && codePoint <= 0xff60) ||
      (codePoint >= 0xffe0 && codePoint <= 0xffe6) ||
      (codePoint >= 0x1b000 && codePoint <= 0x1b2ff) ||
      (codePoint >= 0x1f200 && codePoint <= 0x1f251) ||
      (codePoint >= 0x20000 && codePoint <= 0x3fffd))
  )
}

function estimateTextWidth(value: string): number {
  const normalized = value.replace(/\s+/g, ' ').trim()

  return Array.from(normalized).reduce((width, character) => {
    if (/\s/u.test(character)) return width + 0.35
    const codePoint = character.codePointAt(0) ?? 0
    return width + (isEastAsianWide(codePoint) ? 1 : 0.55)
  }, 0)
}

function getSingleList(node: AstNode, file: VFileLike): AstNode {
  const children = node.children ?? []
  if (children.length !== 1 || children[0].type !== 'list') {
    fail(file, node, `\`:${node.name}\` must contain exactly one top-level Markdown list`)
  }

  return children[0]
}

function resolveAutomaticChoiceColumns(list: AstNode): 1 | 2 | 4 {
  const longestItem = Math.max(
    0,
    ...(list.children ?? []).map((item) => estimateTextWidth(collectPlainText(item))),
  )

  if (longestItem <= 4.5) return 4
  if (longestItem <= 18) return 2
  return 1
}

function transformNestedPartChoices(parts: AstNode, list: AstNode) {
  const configuredColumns = getAttribute(parts, 'choice-columns') ?? 'auto'

  for (const item of list.children ?? []) {
    if (item.type !== 'listItem') continue

    for (const nestedList of (item.children ?? []).filter((child) => child.type === 'list')) {
      const choiceColumns =
        configuredColumns === 'auto'
          ? String(resolveAutomaticChoiceColumns(nestedList))
          : configuredColumns
      const properties: Record<string, unknown> = {
        ...nestedList.data?.hProperties,
        choiceColumns,
      }

      if (Number.isInteger(nestedList.start) && (nestedList.start as number) >= 1) {
        properties.start = String(nestedList.start)
      }

      nestedList.data = {
        ...nestedList.data,
        hName: 'ExerciseChoices',
        hProperties: properties,
      }
    }
  }
}

function hasDirectiveDescendant(node: AstNode): boolean {
  return (node.children ?? []).some(
    (child) => isDirective(child) || hasDirectiveDescendant(child),
  )
}

function serializeMindMap(node: AstNode, file: VFileLike): string {
  if (hasDirectiveDescendant(node)) {
    fail(file, node, '`mindmap` content cannot contain nested directives')
  }

  let source: string

  try {
    const root = {
      type: 'root',
      children: node.children ?? [],
    } as Parameters<typeof toMarkdown>[0]
    source = toMarkdown(root).trim()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    fail(file, node, `Unable to serialize \`mindmap\` content: ${message}`)
  }

  if (!source) {
    fail(file, node, '`mindmap` requires non-empty Markdown content')
  }

  return source
}

function normalizeProperties(
  node: AstNode,
  component: ComponentName,
  file: VFileLike,
): Record<string, unknown> {
  const properties: Record<string, unknown> = {}

  for (const [rawName, rawValue] of Object.entries(node.attributes ?? {})) {
    const name = attributeNames[rawName] ?? rawName
    properties[name] = rawValue ?? ''
  }

  if (component === 'Exercise') {
    const keepTogether = parseBoolean(node, 'keep-together', file)
    const breakBefore = parseBoolean(node, 'break-before', file)
    if (keepTogether !== undefined) properties.keepTogether = keepTogether
    if (breakBefore !== undefined) properties.breakBefore = breakBefore
  }

  if (component === 'ExerciseChoices') {
    const list = getSingleList(node, file)
    const choiceColumns = getAttribute(node, 'choice-columns') ?? 'auto'
    if (choiceColumns === 'auto') {
      properties.choiceColumns = String(resolveAutomaticChoiceColumns(list))
    } else {
      properties.choiceColumns = choiceColumns
    }

    if (!('start' in properties) && Number.isInteger(list.start) && (list.start as number) >= 1) {
      properties.start = String(list.start)
    }
  }

  if (component === 'ExerciseParts') {
    const list = getSingleList(node, file)
    if (!('start' in properties) && Number.isInteger(list.start) && (list.start as number) >= 1) {
      properties.start = String(list.start)
    }
    delete properties.choiceColumns
  }

  if (component === 'MindMap') {
    properties.source = serializeMindMap(node, file)
  }

  return properties
}

function transformTree(
  node: AstNode,
  file: VFileLike,
  components: WeakMap<AstNode, ComponentName>,
) {
  const component = components.get(node)

  if (component) {
    node.data = {
      ...node.data,
      hName: component,
      hProperties: normalizeProperties(node, component, file),
    }

    if (component === 'ExerciseParts' || component === 'ExerciseChoices') {
      const list = getSingleList(node, file)
      if (component === 'ExerciseParts') transformNestedPartChoices(node, list)
      node.children = list.children ?? []
    } else if (component === 'MindMap') {
      node.children = []
    }
  }

  for (const child of node.children ?? []) {
    transformTree(child, file, components)
  }
}

export function remarkContentDirectives() {
  return (tree: AstRoot, file: VFileLike) => {
    const components = new WeakMap<AstNode, ComponentName>()
    collectComponents(tree, file, components)
    validateTree(tree, file, components)
    transformTree(tree, file, components)
  }
}
