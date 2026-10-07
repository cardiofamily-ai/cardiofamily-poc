import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ENVIRONMENT_NOTICE, PROTOTYPE_NAME_NOTICE, SMALL_SCREEN_NOTICE } from '@/domain/safety'
import { renderApp } from '@/test/render-app'
import { NAV_ITEMS } from './navigation'

const ALL_PATHS = [...NAV_ITEMS.map((item) => item.to), '/families/fam-janssens', '/does-not-exist']

describe('application shell', () => {
  it('uses the exact required environment notice wording', () => {
    expect(ENVIRONMENT_NOTICE).toBe(
      'Synthetic Data · Demonstration Environment · Not for Clinical Use',
    )
  })

  it.each(ALL_PATHS)('shows the persistent safety notice on %s', async (path) => {
    renderApp(path)
    const notice = await screen.findByRole('note', { name: 'Environment notice' })
    expect(notice).toHaveTextContent(ENVIRONMENT_NOTICE)
  })

  it('includes the small-screen notice (CSS hides it at 1024px and above) and the working-name statement', async () => {
    renderApp('/')
    expect(await screen.findByRole('note', { name: 'Screen size notice' })).toHaveTextContent(SMALL_SCREEN_NOTICE)
    expect(screen.getByText(PROTOTYPE_NAME_NOTICE)).toBeInTheDocument()
  })

  it('shows the frozen demo date', async () => {
    renderApp('/')
    expect(await screen.findByText('1 Oct 2026')).toBeInTheDocument()
  })

  it('navigates between clinician sections', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/')
    const nav = await screen.findByRole('navigation', { name: 'Primary' })

    for (const item of NAV_ITEMS.filter((i) => i.to !== '/portal')) {
      await user.click(within(nav).getByRole('link', { name: item.label }))
      expect(router.state.location.pathname).toBe(item.to)
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(within(nav).getByRole('link', { name: item.label })).toHaveAttribute('aria-current', 'page')
    }
  })

  it('opens the relative portal preview outside the clinician shell, with a way back', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/')
    const nav = await screen.findByRole('navigation', { name: 'Primary' })
    await user.click(within(nav).getByRole('link', { name: 'Relative Portal preview' }))
    expect(router.state.location.pathname).toBe('/portal')
    expect(screen.queryByRole('navigation', { name: 'Primary' })).toBeNull()
    await user.click(screen.getByRole('link', { name: /Return to clinician demo/ }))
    expect(router.state.location.pathname).toBe('/')
  })

  it('renders a not-found page for unknown routes', async () => {
    renderApp('/nowhere')
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  })
})
