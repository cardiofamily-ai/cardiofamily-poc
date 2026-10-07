import { screen, within } from '@testing-library/react'
import { renderApp } from '@/test/render-app'

describe('Command Centre', () => {
  it('asks the primary question', async () => {
    renderApp('/')
    expect(await screen.findByRole('heading', { level: 1, name: 'Who needs attention now?' })).toBeInTheDocument()
  })

  it('lists overdue items first, most overdue first', async () => {
    renderApp('/')
    const overdue = await screen.findByRole('region', { name: 'Overdue' })
    const rows = within(overdue).getAllByRole('link')
    expect(rows.map((r) => within(r).getByText(/Dubois|Peeters|Janssens/, { selector: '.font-medium' }).textContent)).toEqual([
      'Thomas Dubois',
      'Bram Peeters',
      'Pieter Janssens',
      'Claire Dubois',
    ])
    expect(rows[0]).toHaveTextContent('Overdue · 212 days')
  })

  it('shows rule ID, WHY and demonstration status on every queue item', async () => {
    renderApp('/')
    const queue = await screen.findByRole('region', { name: 'Attention queue' })
    const rows = within(queue).getAllByRole('link')
    expect(rows.length).toBe(10) // 9 person-level actions + 1 reclassification event
    for (const row of rows) {
      expect(row).toHaveTextContent(/DEMO-R-00[1-6]/)
      expect(row).toHaveTextContent('Demo only · requires clinician review')
    }
  })

  it('summarises the pending reclassification and who it may affect', async () => {
    renderApp('/')
    const section = await screen.findByRole('region', { name: /Variant reclassification/ })
    expect(section).toHaveTextContent('MYH7 SYN-VAR-002')
    expect(section).toHaveTextContent('VUS')
    expect(section).toHaveTextContent('Likely pathogenic')
    expect(section).toHaveTextContent('5 people may need clinician review: Maria, Hilde, Koen, Bram, Lotte')
  })

  it('links each person to their relative profile', async () => {
    renderApp('/')
    const link = await screen.findByRole('link', { name: /Pieter Janssens/ })
    expect(link).toHaveAttribute('href', '/families/fam-janssens/people/p-janssens-pieter')
  })

  it('shows aggregate signals', async () => {
    renderApp('/')
    const signals = await screen.findByText('Families needing attention')
    expect(signals.closest('div')).toHaveTextContent('4 / 5')
  })
})
