import { expect, test, type Locator, type Page } from '@playwright/test'

async function getBounds(locator: Locator) {
  const bounds = await locator.boundingBox()
  if (!bounds) throw new Error('Expected the element to have a visible bounding box.')
  return bounds
}

function expectInsideViewport(
  bounds: { x: number; y: number; width: number; height: number },
  viewport: { width: number; height: number },
  margin = 0,
) {
  expect(bounds.x).toBeGreaterThanOrEqual(margin - 1)
  expect(bounds.y).toBeGreaterThanOrEqual(margin - 1)
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width - margin + 1)
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height - margin + 1)
}

async function installClipboardProbe(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          ;(
            window as typeof window & { __copiedShareText?: string }
          ).__copiedShareText = value
        },
      },
    })
  })
}

async function waitForPanelAnimation(panel: Locator) {
  await expect(panel).toHaveAttribute('data-panel-ready', 'true')
  await panel.evaluate(async (element) => {
    await Promise.all(element.getAnimations().map((animation) => animation.finished))
  })
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.sessionStorage.setItem('blog-dev-skip-splash-once', '1')
  })
})

test('content components render without hydration errors and respond in both directions', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/content-layout-fixture/')
  await expect(page.locator('[data-ready="true"]')).toHaveCount(2)

  await expect(page.locator('[data-mode="float"]')).toHaveAttribute('data-stacked', 'false')
  await expect(page.locator('[data-mode="split"]')).toHaveAttribute('data-stacked', 'false')
  await expect(page.locator('[data-image-group]')).toHaveCSS(
    'grid-template-columns',
    /\d+px \d+px/,
  )
  await expect(page.locator('[data-choice-columns="4"]')).toHaveCount(1)
  await expect(page.locator('[data-choice-columns="2"]')).toHaveCount(3)
  await expect(page.locator('[data-choice-columns="1"]')).toHaveCount(1)

  const exerciseTypography = await page
    .locator('[data-exercise][data-has-source="true"]')
    .first()
    .evaluate((exercise) => {
      const source = exercise.querySelector<HTMLElement>(':scope > div > span')
      const stem = exercise.querySelector<HTMLElement>('[data-exercise-stem]')
      const solution = exercise.querySelector<HTMLElement>(
        '[data-exercise-section="solution"] p',
      )
      const sourceBounds = source?.getBoundingClientRect()
      const stemBounds = stem?.getBoundingClientRect()
      const solutionStyle = solution ? getComputedStyle(solution) : null
      return {
        sourceTop: sourceBounds?.top ?? -1,
        stemTop: stemBounds?.top ?? -1,
        solutionIndent: Number.parseFloat(solutionStyle?.textIndent ?? '0'),
        solutionFontSize: Number.parseFloat(solutionStyle?.fontSize ?? '0'),
      }
    })
  expect(Math.abs(exerciseTypography.sourceTop - exerciseTypography.stemTop)).toBeLessThan(3)
  expect(exerciseTypography.solutionIndent / exerciseTypography.solutionFontSize).toBeCloseTo(2, 1)

  const flowTableLayout = await page
    .locator('[data-mode="split"] [data-flow-media]')
    .evaluate((media) => {
      const table = media.querySelector('table')
      return {
        display: table ? getComputedStyle(table).display : '',
        mediaWidth: media.getBoundingClientRect().width,
        tableWidth: table?.getBoundingClientRect().width ?? 0,
      }
    })
  expect(flowTableLayout.display).toBe('table')
  expect(Math.abs(flowTableLayout.mediaWidth - flowTableLayout.tableWidth)).toBeLessThan(1)

  const desktop = await page.evaluate(() => {
    const splitMedia = document.querySelector<HTMLElement>(
      '[data-mode="split"] [data-flow-media]',
    )
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      invalidParagraphs: [...document.querySelectorAll('p')].filter((paragraph) =>
        paragraph.querySelector('div, section, figure, ol'),
      ).length,
      splitMediaWidth: splitMedia?.getBoundingClientRect().width ?? 0,
    }
  })
  expect(desktop.overflow).toBe(0)
  expect(desktop.invalidParagraphs).toBe(0)
  expect(desktop.splitMediaWidth).toBeGreaterThan(400)
  expect(errors).toEqual([])

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator('[data-mode="float"]')).toHaveAttribute('data-stacked', 'true')
  await expect(page.locator('[data-mode="split"]')).toHaveAttribute('data-stacked', 'true')

  const mobile = await page.evaluate(() => {
    const media = [...document.querySelectorAll<HTMLElement>('[data-flow-media]')]
    const choiceColumns = [...document.querySelectorAll<HTMLElement>('[data-choice-columns]')]
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      mediaWidths: media.map((element) => Math.round(element.getBoundingClientRect().width)),
      contentWidth: Math.round(
        document.querySelector<HTMLElement>('[data-flow-body]')?.getBoundingClientRect().width ?? 0,
      ),
      choiceColumnCounts: choiceColumns.map(
        (element) => getComputedStyle(element).gridTemplateColumns.split(' ').length,
      ),
    }
  })
  expect(mobile.overflow).toBe(0)
  expect(mobile.mediaWidths.every((width) => width === mobile.contentWidth)).toBe(true)
  expect(mobile.choiceColumnCounts.every((columns) => columns === 1)).toBe(true)

  await page.setViewportSize({ width: 1440, height: 1000 })
  await expect(page.locator('[data-mode="float"]')).toHaveAttribute('data-stacked', 'false')
  await expect(page.locator('[data-mode="split"]')).toHaveAttribute('data-stacked', 'false')
})

test('Mermaid diagrams follow the site theme and remain contained on screen and paper', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/content-layout-fixture/')

  const diagram = page.locator('[data-diagram]')
  const canvas = diagram.locator('[role="img"]')
  await expect(diagram).toHaveAttribute('data-ready', 'true')
  await expect(diagram).toHaveAttribute('data-error', 'false')
  await expect(canvas.locator('svg')).toHaveCount(1)

  const lightMarkup = await canvas.innerHTML()
  const lightFill = await canvas.locator('.node rect').first().evaluate(
    (node) => getComputedStyle(node).fill,
  )
  const themeSelect = page.locator('select').filter({ hasText: 'Arona' })
  await themeSelect.selectOption('dark')
  await expect(page.locator('html')).toHaveAttribute('theme', 'dark')
  await expect.poll(() => canvas.innerHTML()).not.toBe(lightMarkup)
  await expect(diagram).toHaveAttribute('data-ready', 'true')
  const darkFill = await canvas.locator('.node rect').first().evaluate(
    (node) => getComputedStyle(node).fill,
  )
  expect(darkFill).not.toBe(lightFill)

  await page.setViewportSize({ width: 390, height: 844 })
  const mobileLayout = await diagram.evaluate((element) => {
    const viewport = element.querySelector<HTMLElement>('[aria-busy]')
    return {
      documentOverflow:
        document.documentElement.scrollWidth - document.documentElement.clientWidth,
      diagramOverflow: (viewport?.scrollWidth ?? 0) - (viewport?.clientWidth ?? 0),
    }
  })
  expect(mobileLayout.documentOverflow).toBe(0)
  expect(mobileLayout.diagramOverflow).toBeGreaterThan(0)

  await page.emulateMedia({ media: 'print' })
  const printLayout = await diagram.evaluate((element) => {
    const svg = element.querySelector<SVGElement>('svg')
    const node = element.querySelector<SVGElement>('.node rect')
    const elementBounds = element.getBoundingClientRect()
    const svgBounds = svg?.getBoundingClientRect()
    const nodeStyle = node ? getComputedStyle(node) : null
    return {
      breakInside: getComputedStyle(element).breakInside,
      fill: nodeStyle?.fill ?? '',
      stroke: nodeStyle?.stroke ?? '',
      svgWidth: svgBounds?.width ?? 0,
      containerWidth: elementBounds.width,
    }
  })
  expect(printLayout.breakInside).toBe('avoid')
  expect(printLayout.fill).toBe('rgb(255, 255, 255)')
  expect(printLayout.stroke).toBe('rgb(68, 68, 68)')
  expect(printLayout.svgWidth).toBeLessThanOrEqual(printLayout.containerWidth + 1)
  expect(errors).toEqual([])
})

test('practice, solution, and note print modes expose the expected content', async ({ page }) => {
  await page.addInitScript(() => {
    window.print = () => undefined
  })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/content-layout-fixture/')
  await expect(page.locator('[data-ready="true"]')).toHaveCount(2)
  await page.emulateMedia({ media: 'print' })
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')))

  await expect(page.locator('[data-site-chrome]').first()).toBeHidden()
  await expect(page.locator('[data-exercise-section]').first()).toBeHidden()
  await expect(page.locator('[data-answer-space]').last()).toHaveCSS('display', 'grid')
  await expect(page.locator('[data-exercise][data-keep-together="true"]').first()).toHaveCSS(
    'break-inside',
    'avoid',
  )
  await expect(page.locator('[data-exercise-set]').first()).toHaveCSS(
    'font-family',
    /LXGW WenKai/,
  )
  const practiceAnswerSpace = await page.locator('[data-answer-space]').last().evaluate((space) => {
    const line = space.querySelector('span')
    return {
      height: space.getBoundingClientRect().height,
      lineColor: line ? getComputedStyle(line).borderBottomColor : '',
    }
  })
  expect(practiceAnswerSpace.height).toBeGreaterThan(0)
  expect(practiceAnswerSpace.lineColor).toBe('rgba(0, 0, 0, 0)')

  const printTypography = await page.evaluate(() => {
    const paragraph = document.querySelector<HTMLElement>('[data-flow-body] p')
    const codeBlock = document.querySelector<HTMLElement>('.blog-code-block')
    const codePre = codeBlock?.querySelector<HTMLElement>('pre')
    const paragraphStyle = paragraph ? getComputedStyle(paragraph) : null
    const codeBlockStyle = codeBlock ? getComputedStyle(codeBlock) : null
    const codePreStyle = codePre ? getComputedStyle(codePre) : null
    return {
      paragraphIndent: Number.parseFloat(paragraphStyle?.textIndent ?? '0'),
      paragraphFontSize: Number.parseFloat(paragraphStyle?.fontSize ?? '0'),
      codeBlockBorder: Number.parseFloat(codeBlockStyle?.borderTopWidth ?? '0'),
      codeBlockBackground: codeBlockStyle?.backgroundColor ?? '',
      codePreBorder: Number.parseFloat(codePreStyle?.borderTopWidth ?? '0'),
      codePreBackground: codePreStyle?.backgroundColor ?? '',
    }
  })
  expect(printTypography.paragraphIndent / printTypography.paragraphFontSize).toBeCloseTo(2, 1)
  expect(printTypography.codeBlockBorder).toBeGreaterThan(0)
  expect(printTypography.codeBlockBackground).toBe('rgb(245, 245, 245)')
  expect(printTypography.codePreBorder).toBe(0)
  expect(printTypography.codePreBackground).toBe('rgba(0, 0, 0, 0)')
  const printedFlowWidths = await page.evaluate(() => {
    const tableFlow = document.querySelector<HTMLElement>('[data-mode="split"]')
    const tableMedia = tableFlow?.querySelector<HTMLElement>('[data-flow-media]')
    const imageFlow = document.querySelector<HTMLElement>('[data-mode="float"]')
    const imageMedia = imageFlow?.querySelector<HTMLElement>('[data-flow-media]')
    const imageFigure = imageMedia?.querySelector<HTMLElement>('figure')
    return {
      tableFlow: tableFlow?.getBoundingClientRect().width ?? 0,
      tableMedia: tableMedia?.getBoundingClientRect().width ?? 0,
      imageMedia: imageMedia?.getBoundingClientRect().width ?? 0,
      imageFigure: imageFigure?.getBoundingClientRect().width ?? 0,
    }
  })
  expect(Math.abs(printedFlowWidths.tableFlow - printedFlowWidths.tableMedia)).toBeLessThan(1)
  expect(printedFlowWidths.imageFigure).toBeGreaterThan(0)
  expect(printedFlowWidths.imageFigure).toBeLessThan(printedFlowWidths.imageMedia)
  const mindMapBounds = await page.locator('[data-mindmap] svg').evaluate((svg) => {
    const canvas = svg.getBoundingClientRect()
    const content = svg.querySelector('g')?.getBoundingClientRect()
    return {
      canvas: { top: canvas.top, right: canvas.right, bottom: canvas.bottom, left: canvas.left },
      content: content
        ? { top: content.top, right: content.right, bottom: content.bottom, left: content.left }
        : null,
    }
  })
  expect(mindMapBounds.content).not.toBeNull()
  expect(mindMapBounds.content!.left).toBeGreaterThanOrEqual(mindMapBounds.canvas.left - 1)
  expect(mindMapBounds.content!.right).toBeLessThanOrEqual(mindMapBounds.canvas.right + 1)
  expect(mindMapBounds.content!.top).toBeGreaterThanOrEqual(mindMapBounds.canvas.top - 1)
  expect(mindMapBounds.content!.bottom).toBeLessThanOrEqual(mindMapBounds.canvas.bottom + 1)
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')))

  await page.emulateMedia({ media: 'screen' })
  const printTrigger = page.getByTitle('打印 / 保存 PDF')
  const printPanel = page.getByRole('dialog', { name: '打印设置' })
  const outlineTrigger = page.getByRole('button', { name: '文章导航' })

  await printTrigger.click()
  await expect(printPanel).toHaveAttribute('data-panel-layout', 'anchored')
  await waitForPanelAnimation(printPanel)
  const printPanelAppearance = await printPanel.evaluate((panel) => {
    const outline = document.querySelector<HTMLElement>('.post-side-list aside')
    const panelStyle = getComputedStyle(panel)
    const outlineStyle = outline ? getComputedStyle(outline) : null
    return {
      panelZIndex: Number(panelStyle.zIndex),
      outlineZIndex: Number(outlineStyle?.zIndex ?? 0),
    }
  })
  expect(printPanelAppearance.panelZIndex).toBeGreaterThan(printPanelAppearance.outlineZIndex)

  const expandedPanelBounds = await getBounds(printPanel)
  const expandedTriggerBounds = await getBounds(printTrigger)
  expect(
    Math.abs(expandedTriggerBounds.x - (expandedPanelBounds.x + expandedPanelBounds.width) - 12),
  ).toBeLessThanOrEqual(1)
  expectInsideViewport(expandedPanelBounds, { width: 1440, height: 1000 }, 12)

  await printTrigger.click()
  await outlineTrigger.click()
  await expect(outlineTrigger).toHaveAttribute('aria-expanded', 'false')
  await expect
    .poll(() =>
      outlineTrigger.evaluate(
        (trigger) => trigger.closest('aside')?.getBoundingClientRect().width ?? 0,
      ),
    )
    .toBeLessThan(60)

  await printTrigger.click()
  await expect(printPanel).toHaveAttribute('data-panel-layout', 'anchored')
  await waitForPanelAnimation(printPanel)
  const collapsedPanelBounds = await getBounds(printPanel)
  const collapsedTriggerBounds = await getBounds(printTrigger)
  expect(
    Math.abs(collapsedTriggerBounds.x - (collapsedPanelBounds.x + collapsedPanelBounds.width) - 12),
  ).toBeLessThanOrEqual(1)
  expect(Math.abs(collapsedPanelBounds.x - expandedPanelBounds.x)).toBeLessThanOrEqual(1)
  expect(Math.abs(collapsedPanelBounds.y - expandedPanelBounds.y)).toBeLessThanOrEqual(1)

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(printPanel).toHaveAttribute('data-panel-layout', 'sheet')
  await waitForPanelAnimation(printPanel)
  const mobilePanelBounds = await getBounds(printPanel)
  expect(Math.abs(mobilePanelBounds.x - 12)).toBeLessThanOrEqual(1)
  expect(Math.abs(390 - mobilePanelBounds.x - mobilePanelBounds.width - 12)).toBeLessThanOrEqual(1)
  expectInsideViewport(mobilePanelBounds, { width: 390, height: 844 })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBe(0)

  await page.setViewportSize({ width: 1440, height: 1000 })
  await expect(printPanel).toHaveAttribute('data-panel-layout', 'anchored')
  await page.getByLabel('题解版').check()
  await page
    .getByRole('dialog', { name: '打印设置' })
    .getByRole('button', { name: '打印 / 保存 PDF' })
    .click()
  await expect(page.locator('[data-post-viewer]')).toHaveAttribute('data-printing', 'true')
  await expect(page.getByRole('status')).toContainText('正在准备打印文档')
  await expect(page.getByRole('status')).toContainText(
    /正在载入字体、图片与图表|正在打开系统打印窗口/,
  )
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('[data-exercise-section]').first()).toBeVisible()
  await expect(page.locator('[data-exercise-section] > div').first()).toBeVisible()
  await expect(page.locator('[data-answer-space]').last()).toBeHidden()
  await expect(page.locator('[data-exercise][data-keep-together="true"]').first()).toHaveCSS(
    'break-inside',
    'auto',
  )

  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')))
  await expect(page.locator('[data-exercise-section]').first()).not.toHaveAttribute('open', '')
  await expect(page.getByRole('status')).toHaveCount(0)

  await page.emulateMedia({ media: 'screen' })
  await page.goto('/content-layout-fixture/?kind=note')
  await expect(page.locator('[data-ready="true"]')).toHaveCount(2)
  await page.getByTitle('打印 / 保存 PDF').click()
  await page
    .getByRole('dialog', { name: '打印设置' })
    .getByRole('button', { name: '打印 / 保存 PDF' })
    .click()
  await expect(page.locator('[data-post-viewer]')).toHaveAttribute('data-printing', 'true')
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('[data-exercise-section]').first()).toBeVisible()
  await expect(page.locator('[data-exercise-section] > div').first()).toBeVisible()
  await expect(page.locator('[data-answer-space]').last()).toBeHidden()

  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')))
  await expect(page.locator('[data-exercise-section]').first()).not.toHaveAttribute('open', '')
})

test('ordinary article printing continues when an image request stalls', async ({ page }) => {
  await page.addInitScript(() => {
    const probe = window as typeof window & { __printCalls?: number }
    probe.__printCalls = 0
    window.print = () => {
      probe.__printCalls = (probe.__printCalls ?? 0) + 1
    }
  })

  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/posts/culture-about-me/')
  await page.evaluate(() => {
    const stalledImage = document.createElement('img')
    stalledImage.alt = '永不完成的打印测试图片'
    stalledImage.loading = 'lazy'
    Object.defineProperty(stalledImage, 'complete', {
      configurable: true,
      get: () => false,
    })
    document.querySelector('article')?.append(stalledImage)
  })

  await page.getByTitle('打印 / 保存 PDF').click()
  const printPanel = page.getByRole('dialog', { name: '打印设置：文章' })
  await expect(printPanel.getByText('打印文章', { exact: true })).toBeVisible()
  await expect(printPanel.getByText('A4 博客文章版式', { exact: true })).toBeVisible()
  await printPanel.getByRole('button', { name: '打印 / 保存 PDF' }).click()

  await expect(page.getByRole('status')).toContainText('正在准备打印文档')
  await expect
    .poll(
      () =>
        page.evaluate(
          () => (window as typeof window & { __printCalls?: number }).__printCalls ?? 0,
        ),
      { timeout: 8000 },
    )
    .toBe(1)
  await expect(page.getByRole('status')).toContainText('正在打开系统打印窗口。')

  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')))
  await expect(page.getByRole('status')).toHaveCount(0)
  await expect(page.locator('[data-post-viewer]')).not.toHaveAttribute('data-printing', 'true')
})

test('scroll-to-top actions track reading progress on posts and collections', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/posts/computer-network-03-application-layer/')

  const postToTop = page.getByRole('button', {
    name: '回到顶部',
    includeHidden: true,
  })
  const postProgressRing = postToTop.locator('circle').last()

  await expect(postToTop).toHaveAttribute('aria-hidden', 'true')
  await expect(postToTop).toHaveAttribute('tabindex', '-1')
  await expect(postToTop).toBeHidden()
  const initialPostOffset = await postProgressRing.evaluate((ring) =>
    Number.parseFloat((ring as SVGCircleElement).style.strokeDashoffset),
  )

  const postScrollTarget = await page.evaluate(() =>
    Math.min(900, document.documentElement.scrollHeight - window.innerHeight),
  )
  expect(postScrollTarget).toBeGreaterThan(600)
  await page.evaluate((target) => window.scrollTo(0, target), postScrollTarget)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(600)

  await expect(postToTop).toHaveAttribute('aria-hidden', 'false')
  await expect(postToTop).toHaveAttribute('tabindex', '0')
  await expect(postToTop).toBeVisible()
  await expect(postToTop).toHaveCSS('opacity', '1')
  await expect
    .poll(() =>
      postProgressRing.evaluate((ring) =>
        Number.parseFloat((ring as SVGCircleElement).style.strokeDashoffset),
      ),
    )
    .toBeLessThan(initialPostOffset - 1)

  await postToTop.click()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(1)
  await expect(postToTop).toHaveAttribute('aria-hidden', 'true')
  await expect(postToTop).toHaveAttribute('tabindex', '-1')
  await expect(postToTop).toBeHidden()

  await page.goto('/collections/computer-network/')
  const collectionToTop = page.getByRole('button', {
    name: '回到顶部',
    includeHidden: true,
  })
  const collectionProgressRing = collectionToTop.locator('circle').last()

  await expect(collectionToTop).toHaveAttribute('aria-hidden', 'true')
  await expect(collectionToTop).toHaveAttribute('tabindex', '-1')
  await expect(collectionToTop).toBeHidden()
  const initialCollectionOffset = await collectionProgressRing.evaluate((ring) =>
    Number.parseFloat((ring as SVGCircleElement).style.strokeDashoffset),
  )

  const collectionScrollTarget = await page.evaluate(() =>
    Math.min(900, document.documentElement.scrollHeight - window.innerHeight),
  )
  expect(collectionScrollTarget).toBeGreaterThan(600)
  await page.evaluate((target) => window.scrollTo(0, target), collectionScrollTarget)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(600)

  await expect(collectionToTop).toHaveAttribute('aria-hidden', 'false')
  await expect(collectionToTop).toHaveAttribute('tabindex', '0')
  await expect(collectionToTop).toBeVisible()
  await expect(collectionToTop).toHaveCSS('opacity', '1')
  await expect
    .poll(() =>
      collectionProgressRing.evaluate((ring) =>
        Number.parseFloat((ring as SVGCircleElement).style.strokeDashoffset),
      ),
    )
    .toBeLessThan(initialCollectionOffset - 1)
})

test('post sharing exposes its SEO preview, copies the canonical link, and excludes other panels', async ({
  page,
}) => {
  await installClipboardProbe(page)
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/posts/computer-network-03-application-layer/')

  const rail = page.locator('[data-page-side-actions]')
  const shareTrigger = page.getByRole('button', { name: '复制分享链接', exact: true })
  const sharePanel = page.getByRole('tooltip', { name: '分享《应用层》' })
  const printTrigger = page.getByTitle('打印 / 保存 PDF')
  const printPanel = page.getByRole('dialog', { name: '打印设置' })

  await expect(rail).toBeVisible()
  await shareTrigger.hover()
  await expect(sharePanel).toBeVisible()
  await expect(shareTrigger).toHaveAttribute('aria-expanded', 'true')
  await expect(sharePanel.getByRole('heading', { name: '应用层', exact: true })).toBeVisible()
  await expect(sharePanel).toHaveAttribute('data-panel-ready', 'true')

  const shareAnimationName = await sharePanel.evaluate(
    (panel) => getComputedStyle(panel).animationName,
  )
  expect(shareAnimationName).not.toBe('none')
  await waitForPanelAnimation(sharePanel)

  const seoDescription = await page
    .locator('meta[name="description"]')
    .first()
    .getAttribute('content')
  expect(seoDescription).toBeTruthy()
  await expect(sharePanel.getByText(seoDescription!, { exact: true })).toBeVisible()
  await expect(sharePanel.locator('svg[aria-hidden="true"]')).toBeVisible()
  await expect(
    sharePanel.getByText('扫描二维码，在其他设备上查看此文章', { exact: true }),
  ).toBeVisible()

  const shareLayout = await sharePanel.evaluate((panel) => {
    const description = panel.querySelector<HTMLElement>('p')
    const qrCode = panel.querySelector<SVGElement>('figure svg')
    const caption = panel.querySelector<HTMLElement>('[data-share-qr-caption]')
    const panelBounds = panel.getBoundingClientRect()
    const descriptionBounds = description?.getBoundingClientRect()
    const qrBounds = qrCode?.getBoundingClientRect()
    const captionBounds = caption?.getBoundingClientRect()
    const captionStyle = caption ? getComputedStyle(caption) : null

    return {
      panelWidth: panelBounds.width,
      descriptionRight: descriptionBounds?.right ?? 0,
      qrLeft: qrBounds?.left ?? 0,
      qrWidth: qrBounds?.width ?? 0,
      qrBottom: qrBounds?.bottom ?? 0,
      captionTop: captionBounds?.top ?? 0,
      captionWidth: captionBounds?.width ?? 0,
      captionWhiteSpace: captionStyle?.whiteSpace ?? '',
      captionText: caption?.textContent?.trim() ?? '',
    }
  })
  expect(Math.abs(shareLayout.panelWidth - 336)).toBeLessThanOrEqual(1)
  expect(Math.abs(shareLayout.qrWidth - 88)).toBeLessThanOrEqual(1)
  expect(shareLayout.qrLeft).toBeGreaterThan(shareLayout.descriptionRight)
  expect(shareLayout.captionTop).toBeGreaterThanOrEqual(shareLayout.qrBottom - 1)
  expect(shareLayout.captionWidth).toBeGreaterThan(shareLayout.qrWidth * 2)
  expect(shareLayout.captionWhiteSpace).toBe('nowrap')
  expect(shareLayout.captionText).toBe('扫描二维码，在其他设备上查看此文章')

  const overlayLayout = await page.evaluate(() => {
    const appShell = document.querySelector<HTMLElement>('[data-app-shell]')
    const rail = document.querySelector<HTMLElement>('[data-page-side-actions]')
    const panel = document.querySelector<HTMLElement>('[data-anchored-side-panel]')
    const readMinHeight = (element: HTMLElement | null) => {
      const value = Number.parseFloat(element ? getComputedStyle(element).minHeight : '')
      return Number.isFinite(value) ? value : 0
    }

    return {
      viewportHeight: window.innerHeight,
      appShellMinHeight: readMinHeight(appShell),
      railMinHeight: readMinHeight(rail),
      panelMinHeight: readMinHeight(panel),
      railHeight: rail?.getBoundingClientRect().height ?? 0,
      panelHeight: panel?.getBoundingClientRect().height ?? 0,
      railParentId: rail?.parentElement?.id ?? '',
      panelParentId: panel?.parentElement?.id ?? '',
    }
  })
  expect(overlayLayout.railParentId).toBe('page-overlay-root')
  expect(overlayLayout.panelParentId).toBe('page-overlay-root')
  expect(overlayLayout.appShellMinHeight).toBeGreaterThanOrEqual(
    overlayLayout.viewportHeight - 1,
  )
  expect(overlayLayout.railMinHeight).toBeLessThan(overlayLayout.viewportHeight - 1)
  expect(overlayLayout.panelMinHeight).toBeLessThan(overlayLayout.viewportHeight - 1)
  expect(overlayLayout.railHeight).toBeLessThan(overlayLayout.viewportHeight - 1)
  expect(overlayLayout.panelHeight).toBeLessThan(overlayLayout.viewportHeight - 1)

  await sharePanel.hover()
  await page.waitForTimeout(250)
  await expect(sharePanel).toBeVisible()

  await page.mouse.move(0, 0)
  await expect(sharePanel).toBeHidden()
  await shareTrigger.focus()
  await expect(sharePanel).toBeVisible()
  await expect(shareTrigger).toHaveAttribute('aria-expanded', 'true')

  await shareTrigger.click()
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as typeof window & { __copiedShareText?: string }).__copiedShareText,
      ),
    )
    .toBe(
      '【QuetzalSidera的个人博客｜应用层】https://quetzalsidera.me/posts/computer-network-03-application-layer/',
    )

  await printTrigger.click()
  await expect(printPanel).toBeVisible()
  await expect(sharePanel).toBeHidden()

  await shareTrigger.hover()
  await expect(sharePanel).toBeVisible()
  await expect(printPanel).toBeHidden()

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect
    .poll(() => sharePanel.evaluate((panel) => getComputedStyle(panel).animationName))
    .toBe('none')

  await page.emulateMedia({ media: 'print' })
  await expect(rail).toBeHidden()
  await expect(sharePanel).toBeHidden()
})

test('collection pages expose only sharing and scroll-to-top actions', async ({ page }) => {
  await installClipboardProbe(page)
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/collections/computer-network/')

  const rail = page.locator('[data-page-side-actions]')
  const shareTrigger = page.getByRole('button', { name: '复制分享链接', exact: true })
  const sharePanel = page.getByRole('tooltip', { name: '分享《计算机网络》' })

  await expect(rail).toBeVisible()
  expect(
    await rail.locator(':scope > button').evaluateAll((buttons) =>
      buttons.map((button) => button.getAttribute('aria-label')),
    ),
  ).toEqual(['复制分享链接', '回到顶部'])
  await expect(page.getByRole('button', { name: '文章导航' })).toHaveCount(0)
  await expect(page.getByTitle('打印 / 保存 PDF')).toHaveCount(0)

  await page.setViewportSize({ width: 390, height: 844 })
  await shareTrigger.click()
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as typeof window & { __copiedShareText?: string }).__copiedShareText,
      ),
    )
    .toBe(
      '【QuetzalSidera的个人博客｜计算机网络】https://quetzalsidera.me/collections/computer-network/',
    )
  await expect(sharePanel).toBeVisible()

  await expect(sharePanel).toHaveAttribute('data-panel-layout', 'sheet')
  await waitForPanelAnimation(sharePanel)
  const mobilePanelBounds = await getBounds(sharePanel)
  expect(Math.abs(mobilePanelBounds.x - 12)).toBeLessThanOrEqual(1)
  expect(Math.abs(390 - mobilePanelBounds.x - mobilePanelBounds.width - 12)).toBeLessThanOrEqual(1)
  expectInsideViewport(mobilePanelBounds, { width: 390, height: 844 })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBe(0)

  await page.emulateMedia({ media: 'print' })
  await expect(rail).toBeHidden()
  await expect(sharePanel).toBeHidden()
})

test('migrated network notes and exercise sheets use the content components', async ({ page }) => {
  await page.addInitScript(() => {
    window.print = () => undefined
  })
  await page.setViewportSize({ width: 1440, height: 1000 })

  await page.goto('/posts/computer-network-01-overview/')
  await expect(page.locator('[data-mindmap][data-ready="true"]')).toHaveCount(1)

  await page.goto('/posts/computer-network-03-application-layer/')
  await expect(page.locator('[data-mindmap][data-ready="true"]')).toHaveCount(1)
  await expect(page.locator('[data-mode="float"]')).toHaveCount(7)
  await expect(page.locator('[data-mode="split"]')).toHaveCount(3)
  await expect(page.locator('[data-image-group]')).toHaveCount(1)
  const mimeTableLayout = await page
    .getByRole('table')
    .filter({ has: page.getByRole('columnheader', { name: '首部', exact: true }) })
    .first()
    .evaluate((table) => {
      const media = table.closest<HTMLElement>('[data-flow-media]')
      return {
        mediaWidth: media?.getBoundingClientRect().width ?? 0,
        tableWidth: table.getBoundingClientRect().width,
      }
    })
  expect(Math.abs(mimeTableLayout.mediaWidth - mimeTableLayout.tableWidth)).toBeLessThan(1)

  await page.setViewportSize({ width: 390, height: 844 })
  await expect
    .poll(() =>
      page.locator('[data-mode="float"], [data-mode="split"]').evaluateAll((flows) =>
        flows.every((flow) => flow.getAttribute('data-stacked') === 'true'),
      ),
    )
    .toBe(true)
  const componentOverflow = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('[data-mode], [data-image-group]')].map(
      (element) => element.scrollWidth - element.clientWidth,
    ),
  )
  expect(componentOverflow.every((overflow) => overflow <= 1)).toBe(true)
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('blockquote:has([data-image-group])')).toHaveCSS(
    'break-inside',
    'avoid',
  )
  const printedQuote = await page.locator('article blockquote').first().evaluate((quote) => {
    const style = getComputedStyle(quote)
    return {
      background: style.backgroundColor,
      borderTop: Number.parseFloat(style.borderTopWidth),
      borderTopColor: style.borderTopColor,
      borderLeftColor: style.borderLeftColor,
    }
  })
  expect(printedQuote.background).toBe('rgb(245, 245, 245)')
  expect(printedQuote.borderTop).toBeGreaterThan(0)
  expect(printedQuote.borderTopColor).toBe('rgb(170, 170, 170)')
  expect(printedQuote.borderLeftColor).toBe('rgb(51, 51, 51)')
  await page.emulateMedia({ media: 'screen' })

  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/posts/computer-network-02-overview-task/')
  await expect(page.locator('[data-exercise]')).toHaveCount(8)
  await expect(page.locator('[data-exercise-section="answer"]')).toHaveCount(8)
  await expect(page.locator('[data-exercise-section="solution"]')).toHaveCount(8)
  await expect(page.locator('[data-exercise-group]').first()).toHaveAttribute('data-start', '1')
  const exerciseNumberRule = await page
    .locator('[data-exercise] > span')
    .first()
    .evaluate((number) => getComputedStyle(number, '::before').content)
  expect(exerciseNumberRule).toContain('decimal-leading-zero')
  await page.getByTitle('打印 / 保存 PDF').click()
  await page
    .getByRole('dialog', { name: '打印设置' })
    .getByRole('button', { name: '打印 / 保存 PDF' })
    .click()
  await expect(page.locator('[data-post-viewer]')).toHaveAttribute('data-printing', 'true')
  const allImagesReady = await page
    .locator('article img')
    .evaluateAll((images) => images.every((image) => image.complete))
  expect(allImagesReady).toBe(true)
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')))

  await page.goto('/posts/computer-network-05-application-layer-task/')
  await expect(page.locator('[data-exercise]')).toHaveCount(9)
  await expect(page.locator('[data-exercise][data-keep-together="false"]')).toHaveCount(1)
})

test('post links keep the old page covered until client navigation commits', async ({ page }) => {
  let targetDocumentRequests = 0
  page.on('request', (request) => {
    if (
      request.resourceType() === 'document' &&
      request.url().includes('/posts/computer-network-03-application-layer/')
    ) {
      targetDocumentRequests += 1
    }
  })
  await page.route('**/posts/computer-network-03-application-layer/**', async (route) => {
    if (route.request().headers().rsc === '1') {
      await new Promise((resolve) => setTimeout(resolve, 2200))
    }
    await route.continue()
  })

  await page.goto('/posts/computer-network-05-application-layer-task/')
  const link = page.locator('a', { hasText: '主动模式与被动模式' }).first()
  await link.evaluate((anchor) => {
    const details = anchor.closest('details')
    if (details) details.open = true
  })
  await link.scrollIntoViewIfNeeded()
  await page.evaluate(() => {
    ;(window as typeof window & { __clientNavigationProbe?: string }).__clientNavigationProbe =
      'preserved'
  })

  await link.click()
  await page.waitForTimeout(1200)
  await expect(page.locator('body')).toHaveClass(/page-exiting/)
  await expect(page.getByText('加载中……', { exact: true })).toBeVisible()
  const pendingMainOpacity = await page.locator('main').evaluate((main) =>
    Number.parseFloat(getComputedStyle(main).opacity),
  )
  expect(pendingMainOpacity).toBe(0)

  await expect(page).toHaveURL(/\/posts\/computer-network-03-application-layer\//)
  await expect(page.locator('#主动模式与被动模式')).toBeVisible()
  await expect(page.locator('body')).not.toHaveClass(/page-exiting/)
  await expect(page.getByText('加载中……', { exact: true })).toHaveCount(0)
  expect(targetDocumentRequests).toBe(0)
  expect(
    await page.evaluate(
      () =>
        (window as typeof window & { __clientNavigationProbe?: string }).__clientNavigationProbe,
    ),
  ).toBe('preserved')
})
