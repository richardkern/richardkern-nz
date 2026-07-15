import { test, expect } from '@playwright/test'

/**
 * Regression coverage for the accessibility, responsive, and media-pipeline
 * fixes from the impeccable audit (2026-07-15). Content is discovered at
 * runtime rather than hardcoded, and content-dependent checks skip cleanly when
 * a fixture is absent, so the spec stays green across environments.
 * Paths are relative to Playwright's baseURL (the PORT-derived dev URL).
 */
test.describe('Accessibility & responsive regressions', () => {
  test('inner pages expose a skip link to #main', async ({ page }) => {
    await page.goto('/posts')
    const skip = page.locator('a[href="#main"]')
    await expect(skip).toHaveCount(1)
    await expect(page.locator('main#main')).toHaveCount(1)
    // sr-only until focused, then revealed (focus:not-sr-only).
    await skip.focus()
    await expect(skip).toBeVisible()
  })

  test('homepage exposes a banner landmark at desktop and mobile', async ({ page }) => {
    for (const width of [1440, 375]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/')
      // The mobile bar and the desktop spine are breakpoint-exclusive, so
      // exactly one banner is in the a11y tree at any width.
      await expect(page.getByRole('banner')).toHaveCount(1)
    }
  })

  for (const path of ['/', '/posts', '/work']) {
    test(`no horizontal overflow at 375px on ${path}`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 800 })
      await page.goto(path)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow, `horizontal overflow on ${path}`).toBeLessThanOrEqual(1)
    })
  }

  test('primary nav links meet a ~44px tap target', async ({ page }) => {
    await page.goto('/')
    const link = page.getByRole('link', { name: 'Posts' }).first()
    const box = await link.boundingBox()
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(40)
  })

  test('theme toggle applies an explicit theme', async ({ page }) => {
    await page.goto('/')
    await page
      .getByRole('button', { name: /Theme:/ })
      .first()
      .click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', /light|dark|auto/)
  })
})

test.describe('Media pipeline regressions', () => {
  test('optimized images request q=75 and carry alt text', async ({ page }) => {
    await page.goto('/work')
    const img = page.locator('img').first()
    if ((await img.count()) === 0) test.skip(true, 'no images on /work in this environment')
    await expect(img).toHaveAttribute('alt', /\S/)
    // Next 16 rejects a quality absent from images.qualities; the Media default
    // is 75, so the optimizer URL must carry q=75 (not the old hardcoded 100).
    await expect(img).toHaveAttribute('src', /[?&]q=75(?:&|$)/)
  })

  test('image lightbox opens, traps focus, and closes on Esc', async ({ page }) => {
    await page.goto('/work')
    const firstProject = page.locator('a[href^="/work/"]').first()
    if ((await firstProject.count()) === 0) test.skip(true, 'no projects to open')
    await firstProject.click()
    await page.waitForURL(/\/work\/.+/)

    const zoom = page.getByRole('button', { name: /Enlarge image/ }).first()
    if ((await zoom.count()) === 0) test.skip(true, 'no zoomable image on this project')
    await zoom.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    // Single-control dialog: Tab keeps focus on the close button.
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Close enlarged image' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
  })
})
