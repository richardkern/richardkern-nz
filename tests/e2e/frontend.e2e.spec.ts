import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('can load homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page).toHaveTitle(/Richard Kern/)
    const heading = page.locator('h1').first()
    await expect(heading).toHaveText('richardkern.')
  })

  test('404 page is in the log style', async ({ page }) => {
    await page.goto('http://localhost:3000/this-page-does-not-exist')
    const heading = page.locator('h1').first()
    await expect(heading).toHaveText(/isn’t in the log/)
  })
})
