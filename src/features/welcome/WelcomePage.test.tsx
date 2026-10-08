import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { entryPath, GUIDE_PATH } from '@/app/entry'
import { DEMO_ACTION_DISCLAIMER, ENVIRONMENT_NOTICE, PROTOTYPE_NAME_NOTICE, SMALL_SCREEN_NOTICE } from '@/domain/safety'
import { renderApp } from '@/test/render-app'

const PIETER_PATH = `/actions/${encodeURIComponent('DEMO-R-003:p-janssens-pieter:sp-janssens-pieter')}`

describe('Welcome page', () => {
  it('is where a fresh load of the app starts, outside the clinician shell', async () => {
    renderApp(entryPath('/'))
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'One cardiac genetic diagnosis should trigger appropriate care for the whole family.',
      }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Primary' })).toBeNull()
  })

  it('carries the brand, the safety notices and the demo content', async () => {
    renderApp('/welcome')
    expect(await screen.findByRole('note', { name: 'Environment notice' })).toHaveTextContent(ENVIRONMENT_NOTICE)
    expect(screen.getByRole('note', { name: 'Screen size notice' })).toHaveTextContent(SMALL_SCREEN_NOTICE)
    expect(screen.getByText(PROTOTYPE_NAME_NOTICE)).toBeInTheDocument()
    expect(screen.getByText(DEMO_ACTION_DISCLAIMER, { exact: false })).toBeInTheDocument()

    const brand = screen.getByTestId('brand-mark')
    expect(brand).toHaveTextContent('CardioFamilyHCM Family Care POC')
    expect(within(brand).getByRole('presentation')).toHaveAttribute('alt', '')

    const headings = screen.getAllByRole('heading').map((h) => `${h.tagName}:${h.textContent}`)
    expect(headings).toEqual([
      'H1:One cardiac genetic diagnosis should trigger appropriate care for the whole family.',
      'H2:What this POC demonstrates',
      'H2:Recommended demo journey',
      'H3:Story A — Family Action',
      'H3:Story B — Reclassification Impact',
      'H3:Optional — Relative Portal preview',
    ])
    expect(screen.getByRole('list', { name: 'Story A — Family Action steps' })).toHaveTextContent(
      'Janssens familyPieterOverdue actionWHO / WHAT / WHEN / WHYRecord workflow outcome',
    )
    expect(screen.getByRole('list', { name: 'Story B — Reclassification Impact steps' })).toHaveTextContent(
      'Peeters familyVUS → Likely pathogenicAffected relativesClinician review',
    )
  })

  it('Enter CardioFamily POC opens the Command Centre', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/welcome')
    await user.click(await screen.findByRole('link', { name: 'Enter CardioFamily POC' }))
    expect(router.state.location.pathname).toBe('/')
    expect(screen.getByRole('heading', { level: 1, name: 'Who needs attention now?' })).toBeInTheDocument()
    // The sidebar carries the compact brand mark
    expect(screen.getByTestId('brand-mark')).toHaveTextContent('CardioFamilyHCM Family Care POC')
  })

  it('the CTA is reachable by keyboard', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/welcome')
    await screen.findByRole('heading', { level: 1 })
    const cta = screen.getByRole('link', { name: 'Enter CardioFamily POC' })
    for (let i = 0; i < 5 && document.activeElement !== cta; i++) await user.tab()
    expect(cta).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(router.state.location.pathname).toBe('/')
  })

  it('View demo guide opens the guide', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/welcome')
    await user.click(await screen.findByRole('link', { name: 'View demo guide' }))
    expect(router.state.location.pathname).toBe(GUIDE_PATH)
  })
})

describe('returning to the Welcome page', () => {
  it('is available from the sidebar as About this POC', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/')
    const help = await screen.findByRole('navigation', { name: 'About the demo' })
    await user.click(within(help).getByRole('link', { name: 'About this POC' }))
    expect(router.state.location.pathname).toBe('/welcome')
  })

  it('Reset demo restores the seeded state without leaving the current page', async () => {
    const user = userEvent.setup()
    const { router } = renderApp(PIETER_PATH)
    const workflow = await screen.findByRole('region', { name: 'Workflow' })
    await user.click(within(workflow).getByRole('radio', { name: /Completed/ }))
    await user.click(within(workflow).getByRole('button', { name: 'Record workflow state' }))
    await user.click(screen.getByRole('button', { name: 'Reset demo' }))
    await user.click(screen.getByRole('button', { name: 'Confirm reset' }))
    expect(screen.queryByRole('button', { name: 'Reset demo' })).toBeNull()
    expect(router.state.location.pathname).toBe(PIETER_PATH)
    expect(screen.queryByRole('link', { name: 'Enter CardioFamily POC' })).toBeNull()
  })
})
