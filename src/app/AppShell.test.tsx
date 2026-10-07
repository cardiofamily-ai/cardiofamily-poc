import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ENVIRONMENT_NOTICE } from '@/domain/safety'
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

  it('shows the frozen demo date', async () => {
    renderApp('/')
    expect(await screen.findByText('1 Oct 2026')).toBeInTheDocument()
  })

  it('navigates between primary sections', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/')
    const nav = await screen.findByRole('navigation', { name: 'Primary' })

    for (const item of NAV_ITEMS) {
      await user.click(within(nav).getByRole('link', { name: item.label }))
      expect(router.state.location.pathname).toBe(item.to)
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(within(nav).getByRole('link', { name: item.label })).toHaveAttribute(
        'aria-current',
        'page',
      )
    }
  })

  it('renders a not-found page for unknown routes', async () => {
    renderApp('/nowhere')
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  })
})
