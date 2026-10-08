import AxeBuilder from '@axe-core/playwright'
import { enterPoc, expect, test } from './fixtures'

const NOTICE = 'CardioFamily POC is best viewed on a desktop or larger screen.'

test.describe('below 1024px', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  for (const path of ['/', '/guide', '/portal']) {
    test(`shows the notice without blocking the app: ${path}`, async ({ page }) => {
      await page.goto(path)
      const notice = page.getByRole('note', { name: 'Screen size notice' })
      await expect(notice).toBeVisible()
      await expect(notice).toHaveText(NOTICE)
      await expect(notice).toBeInViewport()
      // The safety banner remains fully readable within the viewport.
      await expect(page.getByRole('note', { name: 'Environment notice' })).toBeInViewport({ ratio: 1 })
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
      expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([])
    })
  }
})

test.describe('Welcome page on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } })
  test('reflows without horizontal scrolling and keeps the CTA reachable', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0)
    await page.getByRole('link', { name: 'Enter CardioFamily POC' }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Who needs attention now?' })).toBeVisible()
  })
})

test('hides the notice at desktop width', async ({ page }) => {
  await enterPoc(page)
  await expect(page.getByRole('note', { name: 'Screen size notice' })).toBeHidden()
})
