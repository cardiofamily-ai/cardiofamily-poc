import { expect, test as base, type FrameLocator } from '@playwright/test'

/**
 * Console messages emitted by the Streamlit host about its own iframe
 * (permission-policy names Chrome does not know, and the standard sandbox
 * notice). They are not produced by CardioFamily.
 */
const STREAMLIT_HOST_MESSAGES = [
  /^Unrecognized feature: '[\w-]+'\.$/,
  /^An iframe which has both allow-scripts and allow-same-origin for its sandbox attribute can escape its sandboxing\.$/,
]

const test = base.extend<{ app: FrameLocator }>({
  app: async ({ page }, provide) => {
    const problems: string[] = []
    const frameRequests: string[] = []
    page.on('console', (m) => {
      if ((m.type() === 'error' || m.type() === 'warning') && !STREAMLIT_HOST_MESSAGES.some((r) => r.test(m.text()))) {
        problems.push(`${m.type()}: ${m.text()}`)
      }
    })
    page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`))
    page.on('request', (r) => {
      if (r.frame() !== page.mainFrame()) frameRequests.push(r.url())
    })
    await page.goto('/')
    const app = page.frameLocator('iframe[title="st.iframe"]')
    await expect(app.getByRole('heading', { level: 1, name: 'Who needs attention now?' })).toBeVisible({ timeout: 30_000 })
    await provide(app)
    expect(problems, 'CardioFamily console errors/warnings').toEqual([])
    expect(frameRequests, 'network requests made by CardioFamily').toEqual([])
  },
})

const nav = (app: FrameLocator, name: string) =>
  app.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name, exact: true })

async function resetDemo(app: FrameLocator) {
  await app.getByRole('button', { name: 'Reset demo' }).click()
  await app.getByRole('button', { name: 'Confirm reset' }).click()
  await expect(app.getByRole('button', { name: 'Reset demo' })).toHaveCount(0)
}

test('CardioFamily fills the Streamlit page with no Streamlit chrome', async ({ page, app }) => {
  const box = await page.locator('iframe[title="st.iframe"]').boundingBox()
  expect(box).toMatchObject({ x: 0, y: 0, width: 1440, height: 900 })
  await expect(page.locator('header[data-testid="stHeader"]')).toBeHidden()
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(900)
  await expect(app.getByRole('note', { name: 'Environment notice' })).toHaveText(
    'Synthetic Data · Demonstration Environment · Not for Clinical Use',
  )
  await expect(app.getByText('CardioFamily is a working prototype name.', { exact: false })).toBeVisible()
  await expect(page.getByText('Synthetic Data · Demonstration Environment')).toHaveCount(0) // not duplicated by the wrapper
})

test('Story A — family action workflow, record link, history, reset', async ({ app }) => {
  await nav(app, 'Families').click()
  await app.getByRole('table').getByRole('link', { name: 'Janssens family' }).click()
  await app.getByRole('group', { name: 'Pedigree of the Janssens family' }).getByRole('button', { name: /^Pieter Janssens/ }).click()
  await app.getByRole('link', { name: 'Open relative profile', exact: true }).click()
  await expect(app.getByRole('heading', { level: 1, name: 'Pieter Janssens' })).toBeVisible()
  await app.getByRole('region', { name: /Outstanding actions/ }).getByRole('link', { name: 'Surveillance review overdue — consider recall' }).click()

  // Evidence link works with in-memory routing and lands on the highlighted record
  await app.getByRole('region', { name: 'Why' }).getByRole('link', { name: 'View record' }).click()
  await expect(app.locator('#record-sp-janssens-pieter')).toBeInViewport()
  await expect(app.locator('#record-sp-janssens-pieter')).toHaveClass(/bg-accent/)
  await app.getByRole('region', { name: /Outstanding actions/ }).getByRole('link', { name: 'Surveillance review overdue — consider recall' }).click()

  const workflow = app.getByRole('region', { name: 'Workflow' })
  await workflow.getByRole('radio', { name: /Completed/ }).check()
  await workflow.getByLabel(/Note/).fill('Recall letter sent (synthetic)')
  await workflow.getByRole('button', { name: 'Record workflow state' }).click()
  await expect(app.getByRole('status', { name: 'Workflow outcome' })).toContainText('Clinical care is unchanged.')

  await app.getByRole('link', { name: /Open Pieter Janssens’s profile/ }).click()
  await expect(app.getByRole('region', { name: 'Action and review history' })).toContainText('Recall letter sent (synthetic)')
  await nav(app, 'Command Centre').click()
  await expect(app.getByText(/^13 outstanding actions/)).toBeVisible()
  await resetDemo(app)
  await expect(app.getByText(/^14 outstanding actions/)).toBeVisible()
})

test('Story B — reclassification impact review, family update, reset', async ({ app }) => {
  await app.getByRole('region', { name: /Variant reclassification — awaiting impact review/ }).getByRole('link').click()
  await expect(app.getByRole('heading', { level: 1, name: 'Reclassification impact' })).toBeVisible()
  await expect(app.getByRole('list', { name: 'Potentially affected relatives' }).locator(':scope > li')).toHaveCount(5)
  const review = app.getByRole('region', { name: 'Clinician review' })
  await review.getByRole('radio', { name: /^Reviewed/ }).check()
  await review.getByRole('button', { name: 'Record decision' }).click()
  await expect(app.getByRole('status', { name: 'Review outcome' })).toContainText('not an automated medical decision')
  await app.getByRole('link', { name: /Return to Peeters family/ }).click()
  await expect(app.getByRole('region', { name: 'Variant reclassification' })).toContainText('No care has been changed.')
  await app.getByRole('link', { name: 'Open relative profile for Koen Peeters' }).click()
  await expect(app.getByRole('region', { name: 'Risk' })).toContainText('Genotype-positive / phenotype-positive')
  await nav(app, 'Command Centre').click()
  await expect(app.getByText(/^12 outstanding actions/)).toBeVisible()
  await resetDemo(app)
  await expect(app.getByText(/^14 outstanding actions/)).toBeVisible()
})

test('every main screen is reachable by in-app navigation', async ({ app }) => {
  await nav(app, 'Actions').click()
  await expect(app.getByRole('heading', { level: 1, name: 'Actions' })).toBeVisible()
  await app.getByRole('table').getByRole('link').first().click()
  await expect(app.getByRole('article', { name: 'Action detail' })).toBeVisible()
  await nav(app, 'Reclassifications').click()
  await expect(app.getByRole('heading', { level: 1, name: 'Reclassifications' })).toBeVisible()
  await nav(app, 'Families').click()
  await app.getByRole('table').getByRole('link', { name: 'Peeters family' }).click()
  await expect(app.getByRole('heading', { level: 1, name: 'Peeters family' })).toBeVisible()
  await nav(app, 'Relative Portal preview').click()
  await expect(app.getByRole('region', { name: 'Portal preview for Pieter Janssens' })).toContainText('Hello, Pieter')
  await app.getByRole('link', { name: /Return to clinician demo/ }).click()
  await expect(app.getByRole('heading', { level: 1, name: 'Who needs attention now?' })).toBeVisible()
})

test('keyboard operation inside the embedded app', async ({ page, app }) => {
  const frame = page.frames().find((f) => f.url() === 'about:srcdoc')!
  // Start sequential focus navigation inside CardioFamily, then Tab to Pieter's overdue row.
  await app.getByRole('heading', { level: 1 }).click()
  let reached = false
  for (let i = 0; i < 45 && !reached; i++) {
    await page.keyboard.press('Tab')
    reached = await frame.evaluate(() => {
      const t = document.activeElement?.textContent ?? ''
      return t.includes('Pieter Janssens') && t.includes('Overdue')
    })
  }
  expect(reached).toBe(true)
  await page.keyboard.press('Enter')
  await expect(app.getByRole('article', { name: 'Action detail' })).toBeVisible()
  await app.getByRole('radio', { name: /In progress/ }).focus()
  await page.keyboard.press('Space')
  await app.getByRole('button', { name: 'Record workflow state' }).focus()
  await page.keyboard.press('Enter')
  await expect(app.getByRole('status', { name: 'Workflow outcome' })).toBeFocused()
})

test.describe('below 1024px', () => {
  test.use({ viewport: { width: 390, height: 844 } })
  test('shows the CardioFamily small-screen notice without blocking the app', async ({ app }) => {
    await expect(app.getByRole('note', { name: 'Screen size notice' })).toBeVisible()
    await expect(app.getByRole('note', { name: 'Environment notice' })).toBeVisible()
  })
})
