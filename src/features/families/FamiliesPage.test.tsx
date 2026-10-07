import { screen, within } from '@testing-library/react'
import { renderApp } from '@/test/render-app'

describe('Families list', () => {
  it('lists all synthetic families, most urgent first', async () => {
    renderApp('/families')
    const table = await screen.findByRole('table')
    const rows = within(table).getAllByRole('row').slice(1)
    expect(rows.map((r) => within(r).getByRole('link').textContent)).toEqual([
      'Dubois family',
      'Peeters family',
      'Janssens family',
      'Maes family',
      'Wouters family',
    ])
  })

  it('shows why each family should be opened', async () => {
    renderApp('/families')
    const row = (name: string) => screen.getByRole('link', { name }).closest('tr')!
    await screen.findByRole('table')
    expect(row('Janssens family')).toHaveTextContent('3 of 8 people')
    expect(row('Janssens family')).toHaveTextContent('1 overdue')
    expect(row('Peeters family')).toHaveTextContent('Reclassification received')
    expect(row('Wouters family')).toHaveTextContent('Up to date')
  })

  it('links to the family workspace', async () => {
    renderApp('/families')
    expect(await screen.findByRole('link', { name: 'Janssens family' })).toHaveAttribute('href', '/families/fam-janssens')
  })
})
