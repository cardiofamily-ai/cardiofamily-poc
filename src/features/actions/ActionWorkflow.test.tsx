import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DEMO_ACTION_DISCLAIMER } from '@/domain/safety'
import { renderApp } from '@/test/render-app'

const PIETER = 'DEMO-R-003:p-janssens-pieter:sp-janssens-pieter'
const PIETER_PATH = `/actions/${encodeURIComponent(PIETER)}`

describe('Action detail', () => {
  it('shows WHO / WHAT / WHEN / WHY, rule, workflow status and safety wording', async () => {
    renderApp(PIETER_PATH)
    const detail = await screen.findByRole('article', { name: 'Action detail' })
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Surveillance review overdue — consider recall')
    expect(within(detail).getByRole('region', { name: 'Who' })).toHaveTextContent('Pieter JanssensBrother · Janssens family')
    expect(within(detail).getByRole('region', { name: 'Who' })).toHaveTextContent('Genotype-positive / no phenotype recorded')
    expect(within(detail).getByRole('region', { name: 'When' })).toHaveTextContent('Overdue · 93 days')
    const why = within(detail).getByRole('region', { name: 'Why' })
    expect(why).toHaveTextContent('Seeded surveillance due date 30 Jun 2026 is before the demo date 1 Oct 2026.')
    expect(within(why).getByRole('link', { name: 'View record' })).toHaveAttribute(
      'href', '/families/fam-janssens/people/p-janssens-pieter#record-sp-janssens-pieter',
    )
    expect(within(detail).getByRole('region', { name: 'Rule' })).toHaveTextContent('DEMO-R-003Overdue surveillanceRule version 1.0 · demo-engine 0.1.0')
    // 'Demonstration only — requires clinician review.'
    expect(detail).toHaveTextContent(DEMO_ACTION_DISCLAIMER)
    const panel = screen.getByRole('region', { name: 'Workflow' })
    expect(within(panel).getByText('Open')).toBeInTheDocument()
    expect(panel).toHaveTextContent('Records the CardioFamily workflow state. This does not change clinical care.')
  })

  it('routes reclassification review items to the impact review', async () => {
    renderApp(`/actions/${encodeURIComponent('DEMO-R-006:p-peeters-hilde:rc-peeters-1')}`)
    const panel = await screen.findByRole('region', { name: 'Follows the reclassification impact review' })
    expect(within(panel).getByRole('link', { name: /Open impact review/ })).toHaveAttribute('href', '/reclassifications/rc-peeters-1')
    expect(screen.queryByRole('region', { name: 'Workflow' })).toBeNull()
  })

  it('handles an unknown action', async () => {
    renderApp('/actions/nope')
    expect(await screen.findByRole('heading', { name: 'Action not found' })).toBeInTheDocument()
  })
})

describe('canonical Janssens workflow', () => {
  it('Command Centre → Pieter → In progress → Completed → profile history → Command Centre → reset', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/')

    // Before: Pieter is overdue in the Command Centre
    expect(await screen.findByText(/14 outstanding actions/)).toBeInTheDocument()
    const overdue = screen.getByRole('region', { name: 'Overdue' })
    await user.click(within(overdue).getByRole('link', { name: /Pieter Janssens/ }))
    expect(router.state.location.pathname).toBe(PIETER_PATH)

    // Record In progress
    const panel = () => screen.getByRole('region', { name: 'Workflow' })
    await user.click(within(panel()).getByRole('radio', { name: /In progress/ }))
    await user.click(within(panel()).getByRole('button', { name: 'Record workflow state' }))
    expect(screen.getByRole('status', { name: 'Workflow outcome' })).toHaveTextContent('The item remains outstanding')
    expect(screen.getByRole('status', { name: 'Workflow outcome' })).toHaveFocus()

    // Command Centre: still outstanding but distinguished as In progress
    await user.click(screen.getByRole('link', { name: 'Return to Command Centre' }))
    expect(await screen.findByText(/14 outstanding actions .*\(1 in progress, 0 deferred\)/)).toBeInTheDocument()
    const pieterRow = within(screen.getByRole('region', { name: 'Overdue' })).getByRole('link', { name: /Pieter Janssens/ })
    expect(pieterRow).toHaveTextContent('In progress')

    // Record Completed with a note
    await user.click(pieterRow)
    await user.click(within(panel()).getByRole('radio', { name: /Completed/ }))
    await user.type(within(panel()).getByLabelText(/Note/), 'Recall letter sent (synthetic)')
    await user.click(within(panel()).getByRole('button', { name: 'Record workflow state' }))
    const outcome = screen.getByRole('status', { name: 'Workflow outcome' })
    expect(outcome).toHaveTextContent('Workflow state recorded: Completed.')
    expect(outcome).toHaveTextContent('No new action has been created.')
    expect(outcome).toHaveTextContent('Clinical care is unchanged.')
    expect(panel()).toHaveTextContent('“Recall letter sent (synthetic)”')

    // Profile shows the history and no outstanding action
    await user.click(screen.getByRole('link', { name: /Open Pieter Janssens’s profile/ }))
    const history = await screen.findByRole('region', { name: 'Action and review history' })
    expect(history).toHaveTextContent('Surveillance review overdue — consider recall')
    expect(history).toHaveTextContent('Recall letter sent (synthetic)')
    expect(within(history).getByText('Completed')).toBeInTheDocument()
    expect(within(history).getByText('In progress')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Next action' })).toHaveTextContent('No outstanding actions')

    // Family workspace: Pieter has no outstanding action; the attention list no longer includes him
    await user.click(screen.getByRole('link', { name: /View in family workspace/ }))
    const summary = await screen.findByRole('region', { name: 'Summary for Pieter Janssens' })
    expect(summary).toHaveTextContent('No outstanding actions for this person.')
    await user.click(within(summary).getByRole('button', { name: 'Close person summary' }))
    expect(screen.getByRole('region', { name: 'Who needs attention' })).not.toHaveTextContent('Pieter Janssens')

    // Command Centre: Pieter gone; counts derived from the read model
    await user.click(screen.getByRole('link', { name: 'Command Centre' }))
    expect(await screen.findByText(/13 outstanding actions/)).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Overdue' })).queryByText('Pieter Janssens')).toBeNull()
    expect(within(screen.getByRole('region', { name: 'Overdue' })).getAllByRole('link')).toHaveLength(3)

    // Reset restores the starting state
    await user.click(screen.getByRole('button', { name: 'Reset demo' }))
    await user.click(screen.getByRole('button', { name: 'Confirm reset' }))
    expect(await screen.findByText(/14 outstanding actions/)).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Overdue' })).getByText('Pieter Janssens')).toBeInTheDocument()
  })

  it('works from the keyboard alone', async () => {
    const user = userEvent.setup()
    renderApp(PIETER_PATH)
    const radio = await screen.findByRole('radio', { name: /In progress/ })
    radio.focus()
    await user.keyboard(' ')
    expect(radio).toBeChecked()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('radio', { name: /Completed/ })).toBeChecked()
    await user.tab() // note
    await user.keyboard('Done')
    await user.tab() // submit
    expect(screen.getByRole('button', { name: 'Record workflow state' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('status', { name: 'Workflow outcome' })).toHaveTextContent('Completed')
  })

  it('shows Deferred items as unresolved and labelled', async () => {
    renderApp('/', {
      initialActionLog: [{
        id: 'act-1', actionId: 'DEMO-R-001:p-janssens-eline:var-janssens-mybpc3', state: 'deferred',
        recordedBy: 'Demo Clinician (fictional)', date: '2026-10-01' as never,
      }],
    })
    const row = within(await screen.findByRole('region', { name: /For clinician review/ })).getByRole('link', { name: /Eline Janssens/ })
    expect(row).toHaveTextContent('Deferred')
    expect(screen.getByText(/14 outstanding actions .*\(0 in progress, 1 deferred\)/)).toBeInTheDocument()
  })
})

describe('Actions worklist', () => {
  it('filters by workflow state with counts from the read model', async () => {
    const user = userEvent.setup()
    renderApp('/actions', {
      initialActionLog: [{
        id: 'act-1', actionId: PIETER, state: 'completed', recordedBy: 'Demo Clinician (fictional)', date: '2026-10-01' as never,
      }],
    })
    const filters = await screen.findByRole('group', { name: 'Filter actions' })
    expect(within(filters).getByRole('button', { name: /Outstanding/ })).toHaveTextContent('13')
    expect(within(filters).getByRole('button', { name: /Closed/ })).toHaveTextContent('1')
    await user.click(within(filters).getByRole('button', { name: /Closed/ }))
    const table = screen.getByRole('table', { name: 'Actions — Closed' })
    expect(within(table).getAllByRole('row')).toHaveLength(2)
    expect(table).toHaveTextContent('Pieter Janssens')
    expect(table).toHaveTextContent('Completed')
  })
})
