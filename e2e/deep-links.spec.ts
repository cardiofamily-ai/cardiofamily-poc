import { expect, test } from './fixtures'

const ROUTES: [string, string][] = [
  ['/', 'Who needs attention now?'],
  ['/families', 'Families'],
  ['/families/fam-janssens', 'Janssens family'],
  ['/families/fam-janssens/people/p-janssens-pieter', 'Pieter Janssens'],
  ['/actions', 'Actions'],
  ['/actions/' + encodeURIComponent('DEMO-R-003:p-janssens-pieter:sp-janssens-pieter'), 'Surveillance review overdue — consider recall'],
  ['/reclassifications', 'Reclassifications'],
  ['/reclassifications/rc-peeters-1', 'Reclassification impact'],
  ['/portal', 'Extending family care beyond the clinic'],
]

for (const [path, heading] of ROUTES) {
  test(`direct load and refresh: ${path}`, async ({ page }) => {
    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
    await expect(page.getByRole('note', { name: 'Environment notice' })).toHaveText(
      'Synthetic Data · Demonstration Environment · Not for Clinical Use',
    )
  })
}
