/** Layout checks against the actual demonstration families. */
import { SYNTHETIC_FAMILIES } from '@/data/synthetic'
import { janssensFamily } from '@/data/synthetic/janssens'
import { layoutPedigree, SLOT_WIDTH } from '@/components/pedigree/layout'

describe.each(SYNTHETIC_FAMILIES.map((s) => [s.family.name, s] as const))('%s pedigree layout', (_n, s) => {
  const layout = layoutPedigree(s.people)
  const at = (id: string) => layout.nodes.find((n) => n.personId === id)!

  it('places every person exactly once', () => {
    expect(layout.nodes.map((n) => n.personId)).toEqual(s.people.map((p) => p.id))
  })

  it('never overlaps two people', () => {
    for (const a of layout.nodes) {
      for (const b of layout.nodes) {
        if (a !== b && a.y === b.y) expect(Math.abs(a.x - b.x)).toBeGreaterThanOrEqual(SLOT_WIDTH)
      }
    }
  })

  it('places children one generation below their parents', () => {
    for (const p of s.people) {
      for (const parentId of p.parentIds) expect(at(p.id).generation).toBe(at(parentId).generation + 1)
    }
  })

  it('fits within its bounds', () => {
    for (const n of layout.nodes) {
      expect(n.x).toBeGreaterThan(0)
      expect(n.x).toBeLessThan(layout.width)
      expect(n.y).toBeLessThan(layout.height)
    }
  })
})

describe('Janssens pedigree', () => {
  const layout = layoutPedigree(janssensFamily.people)
  const order = (generation: number) =>
    layout.nodes
      .filter((n) => n.generation === generation)
      .toSorted((a, b) => a.x - b.x)
      .map((n) => n.personId.replace('p-janssens-', ''))

  it('orders siblings by birth and keeps parents of the same children adjacent', () => {
    expect(order(0)).toEqual(['marc', 'annick'])
    expect(order(1)).toEqual(['pieter', 'jonas', 'sarah', 'eline'])
    expect(order(2)).toEqual(['lucas', 'mila'])
  })

  it('joins only recorded parents of the same children', () => {
    expect(layout.segments.filter((s) => s.kind === 'parents')).toHaveLength(2)
  })
})
