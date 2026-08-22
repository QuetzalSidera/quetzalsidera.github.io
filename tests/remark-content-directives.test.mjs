import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkDirective from 'remark-directive'
import { remarkContentDirectives } from '../lib/remark-content-directives.ts'
import { remarkLegacyImages, toMdxSource } from '../lib/mdx.ts'

function compile(source) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(remarkContentDirectives)
  return processor.runSync(processor.parse(source))
}

function findAll(node, hName, results = []) {
  if (node?.data?.hName === hName) results.push(node)
  for (const child of node?.children ?? []) findAll(child, hName, results)
  return results
}

test('transforms flow and image-group directives without changing ordinary Markdown', () => {
  const tree = compile(`
::::flow{mode="float" side="right" media-width="38%" min-text-width="24rem"}
:::media
![示意图](/fixture.svg)
:::
:::body
正文段落。
:::
::::

::::image-group{columns="2" mobile-columns="1" print-columns="2"}
![甲](/a.svg)
![乙](/b.svg)
:::caption
共同图注
:::
::::
`)

  const [flow] = findAll(tree, 'ContentFlow')
  assert.deepEqual(flow.data.hProperties, {
    mode: 'float',
    side: 'right',
    mediaWidth: '38%',
    minTextWidth: '24rem',
  })
  assert.equal(findAll(flow, 'FlowMedia').length, 1)
  assert.equal(findAll(flow, 'FlowBody').length, 1)

  const [group] = findAll(tree, 'ImageGroup')
  assert.deepEqual(group.data.hProperties, {
    columns: '2',
    mobileColumns: '1',
    printColumns: '2',
  })
  assert.equal(findAll(group, 'GroupCaption').length, 1)
})

test('legacy Image markers remain opaque to remark-directive inside flow containers', () => {
  const source = toMdxSource(`
::::flow
:::media
<Image src="/fixture.svg" alt="示意图" caption="图注" />
:::
:::body
正文。
:::
::::
`)
  const processor = unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(remarkLegacyImages)
    .use(remarkContentDirectives)
  const tree = processor.runSync(processor.parse(source))
  const [media] = findAll(tree, 'FlowMedia')

  assert.equal(media.children.length, 1)
  assert.equal(media.children[0].data.hName, 'figure')
  assert.doesNotMatch(JSON.stringify(tree), /LEGACY_IMAGE_DATA/)
})

test('serializes mind-map Markdown into a component property', () => {
  const tree = compile(`
:::mindmap{title="应用层" height="28rem" print-height="78mm" interactive="false"}
- 应用层
  - DNS
  - HTTP
:::
`)
  const [mindMap] = findAll(tree, 'MindMap')

  assert.equal(mindMap.data.hProperties.title, '应用层')
  assert.equal(mindMap.data.hProperties.height, '28rem')
  assert.equal(mindMap.data.hProperties.printHeight, '78mm')
  assert.equal(mindMap.data.hProperties.interactive, 'false')
  assert.match(mindMap.data.hProperties.source, /DNS/)
  assert.deepEqual(mindMap.children, [])
})

test('resolves choice columns and preserves false and zero attributes', () => {
  const tree = compile(`
::::::exercise-set{font="kai"}
:::::exercise-group{title="选择题" start="7"}
::::exercise{type="single" answer-lines="0" keep-together="false"}
:::stem
选择正确的一项。
:::
:::choices{choice-columns="auto"}
- 甲
- 乙
- 丙
- 丁
:::
:::answer
A
:::
:::solution
解析。
:::
::::
:::::
::::::
`)

  const [exercise] = findAll(tree, 'Exercise')
  assert.equal(exercise.data.hProperties.answerLines, '0')
  assert.equal(exercise.data.hProperties.keepTogether, 'false')

  const [choices] = findAll(tree, 'ExerciseChoices')
  assert.equal(choices.data.hProperties.choiceColumns, '4')
  assert.equal(choices.children.length, 4)
})

test('maps nested part lists to choices with an independently resolved layout', () => {
  const tree = compile(`
::::::exercise-set
:::::exercise-group
::::exercise{type="multiple"}
:::stem
分别判断两组报文。
:::
:::parts{choice-columns="auto"}
1. 第一组
   - SYN
   - ACK
2. 第二组
   - 这是一个明显较长、需要独占整行才能阅读的选项说明
   - 另一个较长的选项说明用于验证单列布局
:::
::::
:::::
::::::
`)

  const [parts] = findAll(tree, 'ExerciseParts')
  assert.equal(parts.data.hProperties.choiceColumns, undefined)
  const nestedChoices = findAll(parts, 'ExerciseChoices')
  assert.equal(nestedChoices.length, 2)
  assert.equal(nestedChoices[0].data.hProperties.choiceColumns, '4')
  assert.equal(nestedChoices[1].data.hProperties.choiceColumns, '1')
})

test('rejects ambiguous or misplaced semantic children', () => {
  assert.throws(
    () => compile(':::stem\n题干\n:::'),
    /must be a direct child of `:exercise`/,
  )

  assert.throws(
    () =>
      compile(`
::::flow
:::media
![图](/a.svg)
:::
::::
`),
    /requires exactly 1 direct `FlowBody` child/,
  )
})

test('all existing task posts use the unified exercise structure', () => {
  const postsDirectory = path.join(process.cwd(), 'posts')
  const expectedExerciseCounts = {
    'computer-network-02-overview-task.md': 8,
    'computer-network-05-application-layer-task.md': 9,
    'computer-network-08-transport-layer-udp-task.md': 6,
    'computer-network-09-transport-layer-tcp-task.md': 29,
    'robot-kinematics-04-spinor-basic-task.md': 12,
    'robot-kinematics-09-dof-task.md': 8,
  }
  const taskPosts = fs.readdirSync(postsDirectory)
    .filter((filename) => filename.endsWith('-task.md'))
    .sort()

  assert.deepEqual(taskPosts, Object.keys(expectedExerciseCounts).sort())

  for (const [filename, expectedCount] of Object.entries(expectedExerciseCounts)) {
    const source = fs.readFileSync(path.join(postsDirectory, filename), 'utf8')
    assert.match(source, /^kind:\s*exercise\s*$/m, `${filename} must declare kind: exercise`)

    const tree = compile(toMdxSource(source))
    assert.equal(findAll(tree, 'Exercise').length, expectedCount, filename)
    assert.equal(findAll(tree, 'ExerciseStem').length, expectedCount, filename)
    assert.equal(findAll(tree, 'ExerciseAnswer').length, expectedCount, filename)
    assert.equal(findAll(tree, 'ExerciseSolution').length, expectedCount, filename)
  }
})
