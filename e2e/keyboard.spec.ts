import { enterPoc, expect, test } from './fixtures'

test('primary interactions work from the keyboard', async ({ page }) => {
  await enterPoc(page)
  // Tab through the page in order: reach Pieter's overdue row and open it
  let reached = false
  for (let i = 0; i < 45 && !reached; i++) {
    await page.keyboard.press('Tab')
    reached = await page.evaluate(() => {
      const t = document.activeElement?.textContent ?? ''
      return t.includes('Pieter Janssens') && t.includes('Overdue')
    })
  }
  expect(reached).toBe(true)
  // The focused row shows a visible focus indicator (ring or outline)
  const indicator = await page.evaluate(() => {
    const cs = getComputedStyle(document.activeElement!)
    return { ring: cs.boxShadow, outline: cs.outlineStyle }
  })
  expect(indicator.ring !== 'none' || indicator.outline !== 'none').toBe(true)
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/actions\//)

  // Workflow form by keyboard
  await page.getByRole('radio', { name: /In progress/ }).focus()
  await page.keyboard.press('Space')
  await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('radio', { name: /Completed/ })).toBeChecked()
  await page.keyboard.press('Tab')
  await page.keyboard.type('Done by keyboard')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Record workflow state' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('status', { name: 'Workflow outcome' })).toBeFocused()

  // Pedigree nodes are keyboard-selectable (in-app navigation keeps the in-memory session)
  await page.getByRole('link', { name: 'Janssens family' }).first().focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { level: 1, name: 'Janssens family' })).toBeVisible()
  const node = page.getByRole('group', { name: /Pedigree/ }).getByRole('button', { name: /^Eline Janssens/ })
  await node.focus()
  await page.keyboard.press('Enter')
  await expect(node).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('region', { name: 'Summary for Eline Janssens' })).toBeVisible()

  // Reset by keyboard
  await page.getByRole('button', { name: 'Reset demo' }).focus()
  await page.keyboard.press('Enter')
  await page.getByRole('button', { name: 'Confirm reset' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'Reset demo' })).toHaveCount(0)
})
