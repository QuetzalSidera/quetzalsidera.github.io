import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.sessionStorage.setItem('blog-dev-skip-splash-once', '1')
  })
})

test('poem columns keep a Safari-stable vertical layout beside image groups', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/posts/culture-mc-01/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('[data-poem]')).toHaveCount(2)
  await expect(page.locator('article img')).toHaveCount(18)
  await page.waitForFunction(() =>
    [...document.querySelectorAll('article img')].every((image) => image.complete),
  )
  await page.waitForTimeout(100)

  const layouts = await page.locator('[data-poem]').evaluateAll((poems) =>
    poems.map((poem) => {
      const flow = poem.closest<HTMLElement>('[data-mode]')
      const media = flow?.querySelector<HTMLElement>(':scope > [data-flow-media]')
      const rootStyle = getComputedStyle(poem)
      const columns = [...poem.children].map((column) => {
        const bounds = column.getBoundingClientRect()
        const style = getComputedStyle(column)
        return {
          left: bounds.left,
          top: bounds.top,
          bottom: bounds.bottom,
          writingMode: style.writingMode,
        }
      })

      return {
        poem: poem.getBoundingClientRect(),
        media: media?.getBoundingClientRect(),
        scrollHeight: poem.scrollHeight,
        clientHeight: poem.clientHeight,
        childBottom: Math.max(...columns.map((column) => column.bottom)),
        writingMode: rootStyle.writingMode,
        flexDirection: rootStyle.flexDirection,
        columns,
      }
    }),
  )

  for (const layout of layouts) {
    expect(layout.writingMode).toBe('horizontal-tb')
    expect(layout.flexDirection).toBe('row-reverse')
    expect(layout.media).toBeTruthy()
    expect(Math.abs(layout.poem.height - layout.media!.height)).toBeLessThan(1)
    expect(layout.scrollHeight).toBeLessThanOrEqual(layout.clientHeight + 1)
    expect(layout.childBottom).toBeLessThanOrEqual(layout.poem.bottom + 1)
    expect(layout.columns.every((column) => column.writingMode === 'vertical-rl')).toBe(true)
    expect(Math.max(...layout.columns.map((column) => column.top)) - Math.min(...layout.columns.map((column) => column.top))).toBeLessThan(1)
    expect(layout.columns[0].left).toBeGreaterThan(layout.columns[1].left)
    expect(layout.columns[1].left).toBeGreaterThan(layout.columns[2].left)
  }
})

test('long poem columns expand instead of crossing the lower boundary', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/posts/culture-bluearchive-1st-anniversary/', {
    waitUntil: 'domcontentloaded',
  })

  const poem = page.locator('[data-poem]').first()
  await expect(poem).toBeVisible()
  await expect
    .poll(() => poem.evaluate((element) => element.scrollHeight - element.clientHeight))
    .toBeLessThanOrEqual(1)

  const bounds = await poem.evaluate((element) => {
    const poemBounds = element.getBoundingClientRect()
    const childBottom = Math.max(
      ...Array.from(element.children).map((child) => child.getBoundingClientRect().bottom),
    )
    return { poemBottom: poemBounds.bottom, childBottom }
  })
  expect(bounds.childBottom).toBeLessThanOrEqual(bounds.poemBottom + 1)
})
