import { expect, test } from './fixtures'

test('Relative Portal preview shows only the relative’s own information', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Relative Portal preview' }).click()
  const portal = page.getByRole('region', { name: 'Portal preview for Pieter Janssens' })
  await expect(portal).toContainText('Hello, Pieter')
  await expect(portal.getByRole('region', { name: 'Your next step' })).toBeVisible()
  await expect(portal).toContainText('not medical advice')
  for (const other of ['Sarah', 'Marc', 'Eline', 'Lucas', 'Mila', 'proband']) await expect(portal).not.toContainText(other)
  await expect(page.getByRole('note', { name: 'Environment notice' })).toBeVisible()
  await page.getByRole('link', { name: /Return to clinician demo/ }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Who needs attention now?' })).toBeVisible()
})
