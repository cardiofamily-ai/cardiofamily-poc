import { enterPoc, expect, nav, resetDemo, test } from './fixtures'

test('Story A — family care gap followed through to a workflow outcome', async ({ page }) => {
  await enterPoc(page)
  await expect(page.getByRole('heading', { level: 1, name: 'Who needs attention now?' })).toBeVisible()
  await expect(page.getByText(/^14 outstanding actions/)).toBeVisible()
  const overdue = page.getByRole('region', { name: 'Overdue' })
  await expect(overdue.getByRole('link')).toHaveCount(4)

  // Janssens family → Pieter in the pedigree → relative profile
  await nav(page, 'Families').click()
  await page.getByRole('table').getByRole('link', { name: 'Janssens family' }).click()
  await page.getByRole('group', { name: 'Pedigree of the Janssens family' }).getByRole('button', { name: /^Pieter Janssens/ }).click()
  await page.getByRole('link', { name: 'Open relative profile', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Pieter Janssens' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Risk' })).toContainText('Genotype-positive / no phenotype recorded')

  // Overdue action → WHO / WHAT / WHEN / WHY
  await page.getByRole('region', { name: /Outstanding actions/ }).getByRole('link', { name: 'Surveillance review overdue — consider recall' }).click()
  const detail = page.getByRole('article', { name: 'Action detail' })
  await expect(detail.getByRole('region', { name: 'Who' })).toContainText('Pieter Janssens')
  await expect(detail.getByRole('region', { name: 'What' })).toContainText('Surveillance review overdue — consider recall')
  await expect(detail.getByRole('region', { name: 'When' })).toContainText('Overdue · 93 days')
  await expect(detail.getByRole('region', { name: 'Why' })).toContainText('Seeded surveillance due date 30 Jun 2026')
  await expect(detail.getByRole('region', { name: 'Rule' })).toContainText('DEMO-R-003')
  await expect(detail).toContainText('Demonstration only — requires clinician review.')

  // Record In progress, then Completed with a note
  const workflow = page.getByRole('region', { name: 'Workflow' })
  await workflow.getByRole('radio', { name: /In progress/ }).check()
  await workflow.getByRole('button', { name: 'Record workflow state' }).click()
  await expect(page.getByRole('status', { name: 'Workflow outcome' })).toContainText('remains outstanding')
  await workflow.getByRole('radio', { name: /Completed/ }).check()
  await workflow.getByLabel(/Note/).fill('Recall letter sent (synthetic)')
  await workflow.getByRole('button', { name: 'Record workflow state' }).click()
  await expect(page.getByRole('status', { name: 'Workflow outcome' })).toContainText('No new action has been created. Clinical care is unchanged.')
  await expect(page.getByLabel('Workflow and source record')).toContainText('still reflects the seeded clinical record')

  // Profile: history visible; source record unchanged but labelled
  await page.getByRole('link', { name: /Open Pieter Janssens’s profile/ }).click()
  const history = page.getByRole('region', { name: 'Action and review history' })
  await expect(history).toContainText('Recall letter sent (synthetic)')
  await expect(history.getByText('Completed')).toBeVisible()
  await expect(page.getByRole('table', { name: 'Surveillance plans' })).toContainText('source record unchanged')

  // Command Centre reflects the outcome
  await nav(page, 'Command Centre').click()
  await expect(page.getByText(/^13 outstanding actions/)).toBeVisible()
  await expect(overdue.getByRole('link')).toHaveCount(3)
  await expect(overdue).not.toContainText('Pieter Janssens')

  // Reset restores the starting state
  await resetDemo(page)
  await expect(page.getByText(/^14 outstanding actions/)).toBeVisible()
  await expect(overdue).toContainText('Pieter Janssens')
})
