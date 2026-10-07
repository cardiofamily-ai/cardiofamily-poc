import { expect, nav, resetDemo, test } from './fixtures'

test('Story B — reclassification impact reviewed by the clinician', async ({ page }) => {
  await page.goto('/')
  const queue = page.getByRole('region', { name: /Variant reclassification — awaiting impact review/ })
  await expect(queue).toContainText('5 people may need clinician review')
  await queue.getByRole('link').click()

  await expect(page.getByRole('heading', { level: 1, name: 'Reclassification impact' })).toBeVisible()
  const changed = page.getByRole('region', { name: 'What changed' })
  await expect(changed).toContainText('Last acknowledged classification')
  await expect(changed).toContainText('VUS')
  await expect(changed).toContainText('Likely pathogenic')
  const affected = page.getByRole('list', { name: 'Potentially affected relatives' })
  await expect(affected.locator(':scope > li')).toHaveCount(5)
  await expect(affected).toContainText('Has an active surveillance plan arranged under the previous classification.')
  await expect(page.getByText(/^Not included:/).locator('..')).toContainText('Jozef Peeters (deceased)')

  const review = page.getByRole('region', { name: 'Clinician review' })
  await expect(review.getByRole('button', { name: 'Record decision' })).toBeDisabled()
  await review.getByRole('radio', { name: /^Reviewed/ }).check()
  await review.getByLabel(/Review note/).fill('Impact reviewed at MDT (synthetic)')
  await review.getByRole('button', { name: 'Record decision' }).click()
  await expect(page.getByRole('status', { name: 'Review outcome' })).toContainText('not an automated medical decision')

  // Family context reflects the review
  await page.getByRole('link', { name: /Return to Peeters family/ }).click()
  const header = page.locator('main header').first()
  await expect(header).toContainText('Last acknowledged classificationLikely pathogenic')
  await expect(page.getByRole('region', { name: 'Variant reclassification' })).toContainText('No care has been changed.')
  await expect(page.getByRole('region', { name: 'Who needs attention' })).toContainText('Consider offering cascade genetic testing')

  // Relative profile navigation: Koen now derived from the acknowledged classification
  await page.getByRole('link', { name: 'Open relative profile for Koen Peeters' }).click()
  await expect(page.getByRole('region', { name: 'Risk' })).toContainText('Genotype-positive / phenotype-positive')
  await expect(page.getByRole('region', { name: 'Action and review history' })).toContainText('Impact reviewed at MDT (synthetic)')

  await nav(page, 'Command Centre').click()
  await expect(page.getByText(/^12 outstanding actions/)).toBeVisible()
  await resetDemo(page)
  await expect(page.getByText(/^14 outstanding actions/)).toBeVisible()
  await expect(queue).toBeVisible()
})
