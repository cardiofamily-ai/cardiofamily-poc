import { enterPoc, expect, nav, resetDemo, test, WELCOME_HEADING } from './fixtures'

const ENV_NOTICE = 'Synthetic Data · Demonstration Environment · Not for Clinical Use'

test('a fresh load opens the Welcome page, and Enter CardioFamily POC opens the Command Centre', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/welcome$/)
  await expect(page).toHaveTitle('CardioFamily · HCM Family Care POC')
  await expect(page.getByRole('heading', { level: 1, name: WELCOME_HEADING })).toBeVisible()
  await expect(page.getByRole('note', { name: 'Environment notice' })).toHaveText(ENV_NOTICE)
  await expect(page.getByText('CardioFamily is a working prototype name.', { exact: false })).toBeVisible()
  const brand = page.getByTestId('brand-mark')
  await expect(brand).toContainText('CardioFamily')
  await expect(brand.locator('img')).toHaveAttribute('alt', '')
  expect(await brand.locator('img').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0)

  await page.getByRole('link', { name: 'Enter CardioFamily POC' }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Who needs attention now?' })).toBeVisible()
  await expect(page.getByRole('complementary').getByTestId('brand-mark')).toContainText('HCM Family Care POC')

  // Command Centre stays reachable in-app; deep links open directly without the Welcome page.
  await nav(page, 'Families').click()
  await nav(page, 'Command Centre').click()
  await expect(page.getByRole('heading', { level: 1, name: 'Who needs attention now?' })).toBeVisible()
  await page.goto('/families')
  await expect(page.getByRole('heading', { level: 1, name: 'Families' })).toBeVisible()
})

test('the Enter CTA is keyboard operable with a visible focus indicator', async ({ page }) => {
  await page.goto('/')
  const cta = page.getByRole('link', { name: 'Enter CardioFamily POC' })
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab')
    if (await cta.evaluate((el) => el === document.activeElement)) break
  }
  await expect(cta).toBeFocused()
  const ring = await cta.evaluate((el) => getComputedStyle(el).boxShadow)
  expect(ring).not.toBe('none')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { level: 1, name: 'Who needs attention now?' })).toBeVisible()
})

test('demo guide opens from the Welcome page and from the sidebar, and is navigable', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'View demo guide' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Presenting the CardioFamily POC' })).toBeVisible()

  // Section shortcuts by keyboard move focus to the section
  await page.getByRole('navigation', { name: 'Guide sections' }).getByRole('button', { name: /Resetting the demo/ }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { level: 2, name: /Resetting the demo/ })).toBeFocused()
  await expect(page.getByRole('heading', { level: 2, name: /Resetting the demo/ })).toBeInViewport()

  // Step links open the story
  await page.getByRole('link', { name: 'Families → Janssens family' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Janssens family' })).toBeVisible()

  await page.getByRole('navigation', { name: 'About the demo' }).getByRole('link', { name: 'Demo guide' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Presenting the CardioFamily POC' })).toBeVisible()
  await page.getByRole('navigation', { name: 'About the demo' }).getByRole('link', { name: 'About this POC' }).click()
  await expect(page.getByRole('heading', { level: 1, name: WELCOME_HEADING })).toBeVisible()
})

test('Reset demo does not return to the Welcome page', async ({ page }) => {
  await enterPoc(page)
  await page.getByRole('region', { name: 'Overdue' }).getByRole('link', { name: /Pieter Janssens/ }).click()
  await page.getByRole('radio', { name: /Completed/ }).check()
  await page.getByRole('button', { name: 'Record workflow state' }).click()
  await expect(page.getByRole('status', { name: 'Workflow outcome' })).toBeVisible()
  const url = page.url()
  await resetDemo(page)
  expect(page.url()).toBe(url)
  await expect(page.getByRole('article', { name: 'Action detail' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name: WELCOME_HEADING })).toHaveCount(0)
})
