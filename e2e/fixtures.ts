import { expect, test as base, type Page } from '@playwright/test'

/** Every test fails if the page logs a console error/warning or throws. */
export const test = base.extend<{ consoleProblems: string[] }>({
  consoleProblems: [
    async ({ page }, use) => {
      const problems: string[] = []
      page.on('console', (m) => {
        if (m.type() === 'error' || m.type() === 'warning') problems.push(`${m.type()}: ${m.text()}`)
      })
      page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`))
      await use(problems)
      expect(problems, 'browser console').toEqual([])
    },
    { auto: true },
  ],
})

export { expect }

export const nav = (page: Page, name: string) =>
  page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name, exact: true })

export async function resetDemo(page: Page) {
  await page.getByRole('button', { name: 'Reset demo' }).click()
  await page.getByRole('button', { name: 'Confirm reset' }).click()
  await expect(page.getByRole('button', { name: 'Reset demo' })).toHaveCount(0)
}
