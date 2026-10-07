import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DEMO_ACTION_DISCLAIMER } from '@/domain/safety'
import { renderApp } from '@/test/render-app'

describe('Family Workspace', () => {
  it('identifies the proband and familial variant', async () => {
    renderApp('/families/fam-janssens')
    const header = (await screen.findByRole('heading', { level: 1, name: 'Janssens family' })).closest('header')!
    expect(header).toHaveTextContent('Proband Sarah Janssens')
    expect(header).toHaveTextContent('MYBPC3 SYN-VAR-001')
    expect(header).toHaveTextContent('Pathogenic')
  })

  it('renders every person in the pedigree with an accessible status description', async () => {
    renderApp('/families/fam-janssens')
    const pedigree = await screen.findByRole('group', { name: 'Pedigree of the Janssens family' })
    const nodes = within(pedigree).getAllByRole('button')
    expect(nodes).toHaveLength(8)
    expect(within(pedigree).getByRole('button', { name: /^Pieter Janssens, Brother, 45 years, Genotype positive, No phenotype recorded, 1 open action, 1 overdue$/ })).toBeInTheDocument()
    expect(within(pedigree).getByRole('button', { name: /^Sarah Janssens, Proband/ })).toBeInTheDocument()
  })

  it('never labels anyone as a partner', async () => {
    renderApp('/families/fam-janssens')
    await screen.findByRole('group', { name: /Pedigree/ })
    expect(screen.queryByText(/partner/i)).toBeNull()
    expect(screen.getByRole('button', { name: /^Jonas Verhaegen, Father of Lucas and Mila, 43 years, not a blood relative/ })).toBeInTheDocument()
  })

  it('lists who needs attention by default', async () => {
    renderApp('/families/fam-janssens')
    const panel = await screen.findByRole('region', { name: 'Who needs attention' })
    expect(panel).toHaveTextContent('3 people · 3 outstanding actions')
    expect(within(panel).getAllByRole('button').map((b) => b.textContent)).toEqual([
      expect.stringContaining('Pieter Janssens'),
      expect.stringContaining('Mila Verhaegen'),
      expect.stringContaining('Eline Janssens'),
    ])
  })

  it('shows a person summary with WHAT/WHEN/WHY when a pedigree node is selected', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/families/fam-janssens')
    const pedigree = await screen.findByRole('group', { name: /Pedigree/ })
    await user.click(within(pedigree).getByRole('button', { name: /^Pieter Janssens/ }))

    expect(router.state.location.search).toBe('?person=p-janssens-pieter')
    const panel = screen.getByRole('region', { name: 'Summary for Pieter Janssens' })
    const action = within(panel).getByRole('article', { name: 'Surveillance review overdue — consider recall' })
    expect(action).toHaveTextContent('DEMO-R-003')
    expect(action).toHaveTextContent('Overdue · 93 days')
    expect(action).toHaveTextContent('Why')
    expect(action).toHaveTextContent('next due 30 Jun 2026')
    expect(action).toHaveTextContent(DEMO_ACTION_DISCLAIMER)

    await user.click(within(panel).getByRole('button', { name: 'Close person summary' }))
    expect(router.state.location.search).toBe('')
    expect(screen.getByRole('region', { name: 'Who needs attention' })).toBeInTheDocument()
  })

  it('supports keyboard selection in the pedigree', async () => {
    const user = userEvent.setup()
    renderApp('/families/fam-janssens')
    const node = within(await screen.findByRole('group', { name: /Pedigree/ })).getByRole('button', { name: /^Eline Janssens/ })
    node.focus()
    await user.keyboard('{Enter}')
    expect(node).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('region', { name: 'Summary for Eline Janssens' })).toHaveTextContent('DEMO-R-001')
  })

  it('opens with a person preselected from the URL', async () => {
    renderApp('/families/fam-janssens?person=p-janssens-mila')
    expect(await screen.findByRole('region', { name: 'Summary for Mila Verhaegen' })).toHaveTextContent(
      'Cascade test · sample pending · expected 14 Oct 2026',
    )
  })

  it('shows the relatives table with status for every person', async () => {
    renderApp('/families/fam-janssens')
    const table = await screen.findByRole('table', { name: 'Relatives of Janssens family' })
    const rows = within(table).getAllByRole('row').slice(1)
    expect(rows).toHaveLength(8)
    expect(rows[0]).toHaveTextContent('Pieter Janssens')
    expect(rows[0]).toHaveTextContent('Overdue')
    const jonas = rows.find((r) => r.textContent?.includes('Jonas'))!
    expect(jonas).toHaveTextContent('Not a blood relative')
  })

  it('flags a pending reclassification without changing pathways', async () => {
    renderApp('/families/fam-peeters')
    const notice = await screen.findByRole('region', { name: 'Variant reclassification' })
    expect(notice).toHaveTextContent('5 people may need clinician review')
    expect(notice).toHaveTextContent('pathways are unchanged until a clinician records the impact review')
    expect(notice).toHaveTextContent('Pending clinician review')
    expect(within(notice).getByRole('link', { name: /Open impact review/ })).toHaveAttribute('href', '/reclassifications/rc-peeters-1')
    expect(notice).toHaveTextContent('DEMO-R-006')
  })

  it('shows a family with no open actions as up to date', async () => {
    renderApp('/families/fam-wouters')
    expect(await screen.findByText('All recorded testing and surveillance is up to date.')).toBeInTheDocument()
  })

  it('handles an unknown family', async () => {
    renderApp('/families/nope')
    expect(await screen.findByRole('heading', { name: 'Family not found' })).toBeInTheDocument()
  })
})
