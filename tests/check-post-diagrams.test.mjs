import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { validateFiles } from '../scripts/check-post-diagrams.mjs'

async function withMarkdown(source, run) {
  const directory = await mkdtemp(join(tmpdir(), 'post-diagram-check-'))
  const file = join(directory, 'fixture.md')

  try {
    await writeFile(file, source)
    await run(file)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

test('accepts a valid diagram directive with arrows and a note', async () => {
  await withMarkdown(
    `# 标题

::::diagram{title="请求链路"}

\`\`\`mermaid
flowchart LR
  DNS -->|解析| HTTP
  note@{ shape: note, label: "名称解析" }
  DNS -.-> note
\`\`\`

::::
`,
    async (file) => {
      assert.deepEqual(await validateFiles([file]), [])
    },
  )
})

test('reports the directive path and line for invalid Mermaid syntax', async () => {
  await withMarkdown(
    `# 标题

::::diagram

\`\`\`mermaid
flowchart LR
  A -->
\`\`\`

::::
`,
    async (file) => {
      const errors = await validateFiles([file])
      assert.equal(errors.length, 1)
      assert.match(errors[0], /fixture\.md:3:/)
      assert.match(errors[0], /Parse error/)
    },
  )
})

test('ignores standalone Mermaid fences outside diagram directives', async () => {
  await withMarkdown(
    `\`\`\`mermaid
flowchart LR
  A -->
\`\`\`
`,
    async (file) => {
      assert.deepEqual(await validateFiles([file]), [])
    },
  )
})
