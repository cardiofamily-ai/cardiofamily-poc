import { enterPoc, expect, test } from './fixtures'

test.use({ viewport: { width: 1280, height: 800 } })

const ROUTES = [
  '/', // fresh load → Welcome
  '/guide',
  '/families',
  '/families/fam-janssens',
  '/families/fam-peeters',
  '/families/fam-janssens/people/p-janssens-pieter',
  '/actions/' + encodeURIComponent('DEMO-R-003:p-janssens-pieter:sp-janssens-pieter'),
  '/actions',
  '/reclassifications',
  '/reclassifications/rc-peeters-1',
  '/portal',
]

for (const path of [...ROUTES, 'Command Centre']) {
  test(`1280×800 has no horizontal overflow: ${path}`, async ({ page }) => {
    if (path === 'Command Centre') await enterPoc(page)
    else await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const overflow = await page.evaluate(() => {
      const main = document.querySelector('main')
      return {
        document: document.documentElement.scrollWidth - window.innerWidth,
        main: main ? main.scrollWidth - main.clientWidth : 0,
      }
    })
    expect(overflow.document).toBeLessThanOrEqual(0)
    expect(overflow.main).toBeLessThanOrEqual(1)
    await expect(page.getByRole('note', { name: 'Environment notice' })).toBeInViewport()
  })
}
