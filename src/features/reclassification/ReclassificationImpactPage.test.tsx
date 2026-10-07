import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DEMO_ACTION_DISCLAIMER } from '@/domain/safety'
import { renderApp } from '@/test/render-app'

const IMPACT = '/reclassifications/rc-peeters-1'

describe('Reclassification Impact', () => {
  it('shows the previous and new laboratory classification with report context', async () => {
    renderApp(IMPACT)
    const changed = await screen.findByRole('region', { name: 'What changed' })
    expect(changed).toHaveTextContent('Last acknowledged classification')
    expect(changed).toHaveTextContent('VUS')
    expect(changed).toHaveTextContent('SYN-MDG-2023-0877')
    expect(changed).toHaveTextContent('Latest laboratory classification · awaiting clinician review')
    expect(changed).toHaveTextContent('Likely pathogenic')
    expect(changed).toHaveTextContent('SYN-MDG-2026-1203')
    expect(changed).toHaveTextContent('Received: 24 Sept 2026')
    expect(changed).toHaveTextContent('Koen Peeters has a recorded result for MYH7 SYN-VAR-002')
    expect(changed).toHaveTextContent('CardioFamily does not classify variants')
  })

  it('lists every potentially affected relative with why and what may require review', async () => {
    renderApp(IMPACT)
    const list = await screen.findByRole('list', { name: 'Potentially affected relatives' })
    const rows = within(list).getAllByRole('listitem').filter((li) => li.parentElement === list)
    expect(rows.map((r) => within(r).getAllByRole('link')[0]!.textContent)).toEqual([
      'Maria Lambrecht', 'Hilde Peeters', 'Koen Peeters', 'Bram Peeters', 'Lotte Peeters',
    ])
    const hilde = rows[1]!
    expect(hilde).toHaveTextContent('First-degree relative of a genotype-positive family member')
    expect(hilde).toHaveTextContent('Has an active surveillance plan arranged under the previous classification.')
    expect(hilde).toHaveTextContent('Would be raised for clinician review')
    expect(hilde).toHaveTextContent('DEMO-R-001')
    expect(hilde).toHaveTextContent('The plan itself is not changed.')
    const koen = rows[2]!
    expect(koen).toHaveTextContent('Would no longer apply')
    expect(koen).toHaveTextContent('Interpretation of their result changes (VUS → Likely pathogenic).')
  })

  it('explains who is not included and why', async () => {
    renderApp(IMPACT)
    expect((await screen.findByText(/Not included:/)).closest('p')).toHaveTextContent(
      'Jozef Peeters (deceased); Sofie Mertens (not a blood relative of the proband)',
    )
  })

  it('highlights affected relatives in the pedigree', async () => {
    renderApp(IMPACT)
    const pedigree = await screen.findByRole('group', { name: /potentially affected relatives highlighted/ })
    expect(within(pedigree).getByRole('img', { name: /^Hilde Peeters.*potentially affected/ })).toBeInTheDocument()
    expect(within(pedigree).getByRole('img', { name: /^Sofie Mertens/ })).not.toHaveAccessibleName(/potentially affected/)
  })

  it('requires a decision before recording and states that nothing changes care', async () => {
    renderApp(IMPACT)
    const panel = await screen.findByRole('region', { name: 'Clinician review' })
    expect(within(panel).getByText('Pending clinician review')).toBeInTheDocument()
    expect(within(panel).getByRole('button', { name: 'Record decision' })).toBeDisabled()
    expect(panel).toHaveTextContent('Recording a decision never changes tests, surveillance plans or treatment.')
    expect(panel).toHaveTextContent(DEMO_ACTION_DISCLAIMER)
    expect(within(panel).getAllByRole('radio').map((r) => r.closest('label')!.querySelector('span span')!.textContent)).toEqual([
      'Reviewed', 'Deferred', 'Not applicable',
    ])
  })

  it('runs the full review story: defer, then review, then see the family update, then reset', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/families/fam-peeters')

    // 1–3. Family shows the new report; open the impact review
    const notice = await screen.findByRole('region', { name: 'Variant reclassification' })
    expect(notice).toHaveTextContent('Pending clinician review')
    await user.click(within(notice).getByRole('link', { name: /Open impact review/ }))
    expect(router.state.location.pathname).toBe(IMPACT)

    // Defer with a note
    const panel = () => screen.getByRole('region', { name: 'Clinician review' })
    await user.click(within(panel()).getByRole('radio', { name: /Deferred/ }))
    await user.type(within(panel()).getByLabelText(/Review note/), 'Discuss at MDT')
    await user.click(within(panel()).getByRole('button', { name: 'Record decision' }))
    expect(screen.getByRole('status', { name: 'Review outcome' })).toHaveTextContent('Impact review deferred.')
    expect(screen.getByRole('status', { name: 'Review outcome' })).toHaveFocus()
    expect(panel()).toHaveTextContent('“Discuss at MDT”')

    // 6–7. Record Reviewed
    await user.click(within(panel()).getByRole('radio', { name: /^Reviewed/ }))
    await user.click(within(panel()).getByRole('button', { name: 'Record decision' }))
    const outcome = screen.getByRole('status', { name: 'Review outcome' })
    expect(outcome).toHaveTextContent('Impact reviewed.')
    expect(outcome).toHaveTextContent('4 new items have been raised, each awaiting clinician review')
    expect(outcome).toHaveTextContent('No test, surveillance plan or treatment has been changed.')
    expect(outcome).toHaveTextContent('not an automated medical decision')
    expect(panel()).toHaveTextContent('Recorded as Reviewed by Demo Clinician (fictional) on 1 Oct 2026.')

    // 8. Back in the family, the state has changed
    await user.click(screen.getByRole('link', { name: /Return to Peeters family/ }))
    const after = await screen.findByRole('region', { name: 'Variant reclassification' })
    expect(after).toHaveTextContent('Reviewed')
    expect(after).toHaveTextContent('No care has been changed.')
    expect(screen.getByRole('region', { name: 'Who needs attention' })).toHaveTextContent('Consider offering cascade genetic testing')
    const header = screen.getByRole('heading', { level: 1 }).closest('header')!
    expect(header).toHaveTextContent('Last acknowledged classificationLikely pathogenic')
    expect(header).toHaveTextContent('Latest laboratory classificationLikely pathogenic')
    expect(header).not.toHaveTextContent('Pending clinician review')

    // Command Centre reflects propagation
    await user.click(screen.getByRole('link', { name: 'Command Centre' }))
    expect(await screen.findByText(/12 outstanding actions/)).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: /Variant reclassification — awaiting/ })).toBeNull()

    // Reset restores the seeded state
    await user.click(screen.getByRole('button', { name: 'Reset demo' }))
    await user.click(screen.getByRole('button', { name: 'Confirm reset' }))
    expect(await screen.findByText(/14 outstanding actions/)).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /Variant reclassification — awaiting/ })).toBeInTheDocument()
  })

  it('records Not applicable and can return to pending', async () => {
    const user = userEvent.setup()
    renderApp(IMPACT)
    const panel = await screen.findByRole('region', { name: 'Clinician review' })
    await user.click(within(panel).getByRole('radio', { name: /Not applicable/ }))
    await user.click(within(panel).getByRole('button', { name: 'Record decision' }))
    expect(screen.getByRole('status', { name: 'Review outcome' })).toHaveTextContent('Marked not applicable.')
    await user.click(screen.getByRole('button', { name: 'Return to pending clinician review' }))
    expect(screen.queryByRole('status', { name: 'Review outcome' })).toBeNull()
    expect(screen.getByRole('region', { name: 'Clinician review' })).toHaveTextContent('Pending clinician review')
    expect(screen.getByRole('region', { name: 'Clinician review' })).toHaveTextContent('Not applicable · Demo Clinician')
  })

  it('shows the review on affected relatives’ profiles', async () => {
    renderApp('/families/fam-peeters/people/p-peeters-hilde', {
      initialReviews: [{
        id: 'rev-1', subjectId: 'rc-peeters-1', subjectKind: 'reclassification-event', status: 'reviewed',
        note: 'Synthetic note', reviewer: 'Demo Clinician (fictional)', date: '2026-10-01' as never,
      }],
    })
    expect(await screen.findByRole('region', { name: 'Action and review history' })).toHaveTextContent('Synthetic note')
    expect(screen.getByRole('region', { name: 'Next action' })).toHaveTextContent('Consider offering cascade genetic testing')
  })

  it('lists reclassifications with their review status', async () => {
    renderApp('/reclassifications')
    const table = await screen.findByRole('table', { name: 'Received reclassification events' })
    expect(table).toHaveTextContent('Peeters family')
    expect(table).toHaveTextContent('5 people')
    expect(table).toHaveTextContent('Pending clinician review')
  })

  it('handles an unknown event', async () => {
    renderApp('/reclassifications/nope')
    expect(await screen.findByRole('heading', { name: 'Reclassification not found' })).toBeInTheDocument()
  })
})
