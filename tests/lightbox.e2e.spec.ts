import { expect, test, type Page } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.sessionStorage.setItem('blog-dev-skip-splash-once', '1')
  })
})

async function waitForClientImage(page: Page) {
  const trigger = page.locator('[data-lightbox-trigger]').first()
  await expect(trigger).toBeVisible()
  await expect
    .poll(() =>
      trigger.evaluate((element) =>
        Object.keys(element).some((key) => key.startsWith('__reactProps')),
      ),
    )
    .toBe(true)
  return trigger
}

test('article images open an accessible full-screen preview and restore page state', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/posts/culture-mc-01/', { waitUntil: 'domcontentloaded' })

  await expect(page.locator('[data-lightbox-trigger]')).toHaveCount(18)
  const trigger = await waitForClientImage(page)
  const thumbnail = trigger.locator('img')
  const source = await thumbnail.getAttribute('src')
  const alt = await thumbnail.getAttribute('alt')

  await page.evaluate(() => {
    document.body.style.overflow = 'auto'
    document.body.style.overscrollBehavior = 'contain'
    document.body.style.touchAction = 'pan-y'
  })
  await trigger.click()

  const overlay = page.locator('[data-lightbox-overlay]')
  const dialog = page.locator('[data-lightbox-dialog]')
  const close = page.locator('[data-lightbox-close]')
  const preview = page.locator('[data-lightbox-image]')
  await expect(dialog).toBeVisible()
  await expect(dialog).toHaveAttribute('role', 'dialog')
  await expect(dialog).toHaveAttribute('aria-modal', 'true')
  await expect(overlay).toHaveAttribute('data-lightbox-overlay', 'true')
  await expect(close).toBeFocused()
  await expect(preview).toHaveAttribute('src', source!)
  await expect(preview).toHaveAttribute('alt', alt!)
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .toBe('hidden')
  await expect
    .poll(() => page.evaluate(() => document.body.style.overscrollBehavior))
    .toBe('none')
  await expect
    .poll(() => page.evaluate(() => document.body.style.touchAction))
    .toBe('none')
  await expect
    .poll(() => page.evaluate(() => document.documentElement.style.overflow))
    .toBe('hidden')
  expect(await overlay.evaluate((element) => element.parentElement?.id)).toBe('page-overlay-root')

  const bounds = await preview.boundingBox()
  expect(bounds).not.toBeNull()
  expect(bounds!.x).toBeGreaterThanOrEqual(0)
  expect(bounds!.y).toBeGreaterThanOrEqual(0)
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(1440)
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(1000)

  await preview.click()
  await expect(dialog).toBeVisible()

  await page.keyboard.press('Tab')
  await expect(close).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(close).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(overlay).toHaveCount(0)
  await expect(trigger).toBeFocused()
  expect(await page.evaluate(() => document.body.style.cssText)).toContain('overflow: auto')
  expect(await page.evaluate(() => document.body.style.overscrollBehavior)).toBe('contain')
  expect(await page.evaluate(() => document.body.style.touchAction)).toBe('pan-y')
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('')

  await trigger.click()
  await expect(dialog).toBeVisible()
  const overlayBounds = await overlay.boundingBox()
  expect(overlayBounds).not.toBeNull()
  await page.mouse.click(overlayBounds!.x + 2, overlayBounds!.y + 2)
  await expect(overlay).toHaveCount(0)
})

test('legacy Markdown images use the same lightbox and are hidden from print output', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/content-layout-fixture/', { waitUntil: 'domcontentloaded' })

  const trigger = await waitForClientImage(page)
  await trigger.click()
  await expect(page.locator('[data-lightbox-dialog]')).toBeVisible()

  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('[data-lightbox-overlay]')).toBeHidden()
  await expect(page.locator('article img').first()).toBeVisible()
})
