import { screen } from '@testing-library/react'
import { renderApp } from '@/test/render-app'

const PIETER = 'DEMO-R-003:p-janssens-pieter:sp-janssens-pieter'

describe('Relative Portal preview', () => {
  it('shows only Pieter’s own status and next step', async () => {
    renderApp('/portal')
    const portal = await screen.findByRole('region', { name: 'Portal preview for Pieter Janssens' })
    expect(portal).toHaveTextContent('Hello, Pieter')
    expect(screen.getByRole('region', { name: 'Your next step' })).toHaveTextContent('arranging your next heart screening')
    expect(screen.getByRole('region', { name: 'Your genetic test' })).toHaveTextContent('Your test found the genetic change')
    expect(screen.getByRole('region', { name: 'Your heart screening' })).toHaveTextContent('Next screening on record: 30 Jun 2026')
    expect(portal).toHaveTextContent('not medical advice')
  })

  it('exposes no other family member’s information', async () => {
    renderApp('/portal')
    const portal = await screen.findByRole('region', { name: /Portal preview/ })
    for (const other of ['Sarah', 'Marc', 'Annick', 'Eline', 'Jonas', 'Lucas', 'Mila', 'proband', 'Pathogenic']) {
      expect(portal).not.toHaveTextContent(new RegExp(other, 'i'))
    }
  })

  it('reflects the clinician workflow: no next step once Pieter’s action is completed', async () => {
    renderApp('/portal', {
      initialActionLog: [{ id: 'act-1', actionId: PIETER, state: 'completed', recordedBy: 'Demo Clinician (fictional)', date: '2026-10-01' as never }],
    })
    expect(await screen.findByRole('region', { name: 'Your next step' })).toHaveTextContent('There is nothing you need to do right now.')
  })

  it('keeps the persistent safety notice', async () => {
    renderApp('/portal')
    expect(await screen.findByRole('note', { name: 'Environment notice' })).toBeInTheDocument()
  })
})
