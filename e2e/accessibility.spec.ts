import AxeBuilder from '@axe-core/playwright'
import { expect, test } from './fixtures'

const PIETER_ACTION = '/actions/' + encodeURIComponent('DEMO-R-003:p-janssens-pieter:sp-janssens-pieter')

const PAGES: [string, string][] = [
  ['Command Centre', '/'],
  ['Families', '/families'],
  ['Janssens workspace', '/families/fam-janssens'],
  ['Peeters workspace', '/families/fam-peeters'],
  ['Pieter profile', '/families/fam-janssens/people/p-janssens-pieter'],
  ['Koen profile', '/families/fam-peeters/people/p-peeters-koen'],
  ['Action detail', PIETER_ACTION],
  ['Actions worklist', '/actions'],
  ['Reclassifications', '/reclassifications'],
  ['Reclassification impact', '/reclassifications/rc-peeters-1'],
  ['Relative Portal preview', '/portal'],
  ['Not found', '/nowhere'],
]

async function scan(page: import('@playwright/test').Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  return violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)
}

for (const [name, path] of PAGES) {
  test(`axe: ${name}`, async ({ page }) => {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(await scan(page)).toEqual([])
  })
}

test('axe: states after recording decisions', async ({ page }) => {
  await page.goto('/reclassifications/rc-peeters-1')
  await page.getByRole('radio', { name: /^Reviewed/ }).check()
  await page.getByRole('button', { name: 'Record decision' }).click()
  await expect(page.getByRole('status', { name: 'Review outcome' })).toBeVisible()
  expect(await scan(page)).toEqual([])

  await page.goto(PIETER_ACTION)
  await page.getByRole('radio', { name: /Completed/ }).check()
  await page.getByRole('button', { name: 'Record workflow state' }).click()
  await expect(page.getByRole('status', { name: 'Workflow outcome' })).toBeVisible()
  expect(await scan(page)).toEqual([])
})
