import { miniFamily } from '@/domain/__fixtures__/mini-family'
import { toIsoDate as d } from '@/domain/time'
import { layoutPedigree, SLOT_WIDTH } from './layout'

const { people } = miniFamily()

describe('layoutPedigree', () => {
  const layout = layoutPedigree(people)
  const at = (id: string) => layout.nodes.find((n) => n.personId === id)!

  it('assigns generations from parent links', () => {
    expect(at('grandpa').generation).toBe(0)
    expect(at('proband').generation).toBe(1)
    expect(at('partner').generation).toBe(1)
    expect(at('child').generation).toBe(2)
  })

  it('places a parent who joins through children beside the other parent', () => {
    expect(Math.abs(at('partner').x - at('proband').x)).toBe(SLOT_WIDTH)
  })

  it('centres children beneath their parents', () => {
    const parentsMid = (at('proband').x + at('partner').x) / 2
    const childrenMid = (at('child').x + at('child2').x) / 2
    expect(childrenMid).toBe(parentsMid)
  })

  it('draws a single-parent descent from the parent’s symbol', () => {
    const singleParent = [
      people[0]!,
      { ...people[2]!, parentIds: ['grandpa'] },
    ]
    const result = layoutPedigree(singleParent)
    expect(result.segments.filter((s) => s.kind === 'parents')).toHaveLength(0)
    expect(result.segments.some((s) => s.kind === 'descent')).toBe(true)
  })

  it('still shows people unreachable from any founder', () => {
    const withOrphanCouple = [
      ...people,
      { ...people[0]!, id: 'x', parentIds: ['y'] },
      { ...people[0]!, id: 'y', parentIds: ['x'], dateOfBirth: d('1990-01-01') },
    ]
    expect(layoutPedigree(withOrphanCouple).nodes).toHaveLength(people.length + 2)
  })
})
