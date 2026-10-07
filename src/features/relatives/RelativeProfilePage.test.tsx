import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DEMO_ACTION_DISCLAIMER, DEMO_CATEGORISATION_NOTICE } from '@/domain/safety'
import { renderApp } from '@/test/render-app'

const open = (family: string, person: string) => renderApp(`/families/${family}/people/${person}`)

describe('Relative Profile', () => {
  it('shows RISK, NEXT ACTION and GENETIC INTERPRETATION prominently', async () => {
    open('fam-janssens', 'p-janssens-pieter')
    expect(await screen.findByRole('heading', { level: 1, name: 'Pieter Janssens' })).toBeInTheDocument()

    const risk = screen.getByRole('region', { name: 'Risk' })
    expect(risk).toHaveTextContent('Genotype-positive / no phenotype recorded')
    expect(risk).toHaveTextContent('Brother of the proband (first-degree relative).')
    expect(risk).toHaveTextContent(DEMO_CATEGORISATION_NOTICE)

    const next = screen.getByRole('region', { name: 'Next action' })
    expect(next).toHaveTextContent('Surveillance review overdue — consider recall')
    expect(next).toHaveTextContent('Overdue · 93 days')
    expect(next).toHaveTextContent('DEMO-R-003')
    expect(next).toHaveTextContent(DEMO_ACTION_DISCLAIMER)

    const genetics = screen.getByRole('region', { name: 'Genetic interpretation' })
    expect(genetics).toHaveTextContent('MYBPC3 SYN-VAR-001')
    expect(genetics).toHaveTextContent('Pathogenic')
    expect(genetics).toHaveTextContent('Cascade test · resulted 20 May 2025')
  })

  it('never shows quantitative risk or "carrier" wording', async () => {
    open('fam-janssens', 'p-janssens-lucas')
    await screen.findByRole('heading', { level: 1 })
    const main = screen.getByRole('main')
    expect(main).not.toHaveTextContent(/%|probability|penetrance|\bcarrier\b/i)
  })

  it('shows testing, phenotype and surveillance history', async () => {
    open('fam-janssens', 'p-janssens-sarah')
    expect(await screen.findByRole('table', { name: 'Genetic testing history' })).toHaveTextContent('Diagnostic test')
    const phenotype = screen.getByRole('table', { name: 'Phenotype assessment history' })
    expect(within(phenotype).getAllByRole('row')).toHaveLength(3)
    expect(screen.getByRole('table', { name: 'Surveillance plans' })).toHaveTextContent('20 Apr 2027')
  })

  it('links WHY evidence to the record it cites', async () => {
    open('fam-janssens', 'p-janssens-mila')
    const actions = await screen.findByRole('region', { name: /Outstanding actions/ })
    const links = within(actions).getAllByRole('link', { name: 'View record' })
    expect(links[0]).toHaveAttribute('href', '/families/fam-janssens/people/p-janssens-mila#record-gt-janssens-mila')
    expect(document.getElementById('record-gt-janssens-mila')).not.toBeNull()
  })

  it('shows a reduced view for someone who is not a blood relative', async () => {
    open('fam-janssens', 'p-janssens-jonas')
    expect(await screen.findByRole('region', { name: 'Risk' })).toHaveTextContent('Not a blood relative')
    expect(screen.getByRole('region', { name: 'Next action' })).toHaveTextContent('No outstanding actions')
    expect(screen.getByRole('region', { name: 'Genetic interpretation' })).toHaveTextContent(
      'Familial variant testing not applicable',
    )
    expect(screen.getByRole('region', { name: 'Relationship to proband' })).toHaveTextContent('Father of Lucas and Mila')
    expect(screen.queryByText(/partner/i)).toBeNull()
  })

  it('flags a pending reclassification that may affect this person', async () => {
    open('fam-peeters', 'p-peeters-hilde')
    const genetics = await screen.findByRole('region', { name: 'Genetic interpretation' })
    expect(genetics).toHaveTextContent('Laboratory reclassification')
    expect(genetics).toHaveTextContent('Pending clinician review')
    expect(genetics).toHaveTextContent('workflow unchanged until reviewed')
    expect(screen.getByRole('region', { name: 'Risk' })).toHaveTextContent('At-risk relative / not yet tested')
  })

  it('navigates to other family members from family connections', async () => {
    const user = userEvent.setup()
    const { router } = open('fam-janssens', 'p-janssens-pieter')
    const members = await screen.findByRole('region', { name: 'Janssens family' })
    await user.click(within(members).getByRole('link', { name: /Lucas Verhaegen/ }))
    expect(router.state.location.pathname).toBe('/families/fam-janssens/people/p-janssens-lucas')
    expect(await screen.findByRole('heading', { level: 1, name: 'Lucas Verhaegen' })).toBeInTheDocument()
  })

  it('is reachable from the family workspace person panel', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/families/fam-janssens?person=p-janssens-eline')
    await user.click(await screen.findByRole('link', { name: 'Open relative profile' }))
    expect(router.state.location.pathname).toBe('/families/fam-janssens/people/p-janssens-eline')
  })

  it('handles an unknown person', async () => {
    open('fam-janssens', 'nobody')
    expect(await screen.findByRole('heading', { name: 'Person not found' })).toBeInTheDocument()
  })
})

describe('Relative Profile classification terminology', () => {
  it('distinguishes last acknowledged and latest laboratory classification while review is pending', async () => {
    renderApp('/families/fam-peeters/people/p-peeters-koen')
    const genetics = await screen.findByRole('region', { name: 'Genetic interpretation' })
    expect(genetics).toHaveTextContent('Last acknowledged classificationVUS')
    expect(genetics).toHaveTextContent('Latest laboratory classificationLikely pathogenic')
    expect(genetics).toHaveTextContent('Pending clinician review')
    expect(screen.getByRole('region', { name: 'Risk' })).toHaveTextContent(
      'Derived from the last acknowledged classification (VUS); a newer laboratory report awaits clinician review.',
    )
    expect(screen.getByRole('main')).not.toHaveTextContent(/current classification/i)
  })

  it('shows a single acknowledged classification for families without a reclassification', async () => {
    renderApp('/families/fam-janssens/people/p-janssens-pieter')
    const genetics = await screen.findByRole('region', { name: 'Genetic interpretation' })
    expect(genetics).toHaveTextContent('Last acknowledged classificationPathogenic')
    expect(genetics).not.toHaveTextContent('Latest laboratory classification')
  })
})
