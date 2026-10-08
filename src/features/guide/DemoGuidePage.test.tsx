import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ENVIRONMENT_NOTICE, PROTOTYPE_NAME_NOTICE } from '@/domain/safety'
import { renderApp } from '@/test/render-app'

describe('Demo guide', () => {
  it('opens from the sidebar inside the clinician shell', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/')
    const help = await screen.findByRole('navigation', { name: 'About the demo' })
    await user.click(within(help).getByRole('link', { name: 'Demo guide' }))
    expect(router.state.location.pathname).toBe('/guide')
    expect(screen.getByRole('heading', { level: 1, name: 'Presenting the CardioFamily POC' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })

  it('covers both stories, the portal, reset and the synthetic status, with short step lists', async () => {
    renderApp('/guide')
    await screen.findByRole('heading', { level: 1 })
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'AFamily Action',
      'BReclassification Impact',
      'CRelative Portal preview',
      'DResetting the demo',
      'ESynthetic, demonstration-only status',
    ])
    for (const name of ['Family Action', 'Reclassification Impact']) {
      const steps = within(screen.getByRole('region', { name: new RegExp(name) })).getAllByRole('listitem')
      expect(steps.length).toBeGreaterThanOrEqual(4)
      expect(steps.length).toBeLessThanOrEqual(6)
    }
    const synthetic = screen.getByRole('region', { name: /Synthetic, demonstration-only status/ })
    expect(synthetic).toHaveTextContent(ENVIRONMENT_NOTICE)
    expect(synthetic).toHaveTextContent(PROTOTYPE_NAME_NOTICE)
    expect(synthetic).toHaveTextContent('1 Oct 2026')
  })

  it('section shortcuts move focus to the section heading', async () => {
    const user = userEvent.setup()
    renderApp('/guide')
    const sections = await screen.findByRole('navigation', { name: 'Guide sections' })
    await user.click(within(sections).getByRole('button', { name: /Reclassification Impact/ }))
    expect(screen.getByRole('heading', { level: 2, name: /Reclassification Impact/ })).toHaveFocus()
  })

  it.each([
    ['Families → Janssens family', 'Janssens family'],
    ['direct link', 'Pieter Janssens'],
    ['reclassification awaiting impact review', 'Reclassification impact'],
    ['Peeters family', 'Peeters family'],
  ])('step link “%s” opens a working page', async (link, heading) => {
    const user = userEvent.setup()
    renderApp('/guide')
    await user.click(await screen.findByRole('link', { name: link }))
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
  })

  it('links back to the Welcome page', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/guide')
    await user.click(within(await screen.findByRole('main')).getByRole('link', { name: 'About this POC' }))
    expect(router.state.location.pathname).toBe('/welcome')
  })
})
