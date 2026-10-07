import { miniFamily } from '@/domain/__fixtures__/mini-family'
import { isBloodRelative, kinship } from './kinship'

const { people } = miniFamily()
const k = (from: string, to: string) => kinship(people, from, to)

describe('kinship', () => {
  it.each([
    ['proband', 'proband', 'self', 0, 'Self'],
    ['proband', 'grandpa', 'parent', 1, 'Father'],
    ['proband', 'grandma', 'parent', 1, 'Mother'],
    ['proband', 'sibling', 'sibling', 1, 'Brother'],
    ['proband', 'child', 'child', 1, 'Daughter'],
    ['proband', 'child2', 'child', 1, 'Son'],
    ['child', 'child2', 'sibling', 1, 'Brother'],
    ['child', 'grandma', 'grandparent', 2, 'Grandmother'],
    ['grandpa', 'child', 'grandchild', 2, 'Granddaughter'],
    ['child', 'sibling', 'aunt-uncle', 2, 'Uncle'],
    ['sibling', 'child', 'niece-nephew', 2, 'Niece'],
    ['proband', 'partner', 'co-parent', null, 'Father of child and child2'],
    ['partner', 'proband', 'co-parent', null, 'Mother of child and child2'],
    ['grandpa', 'grandma', 'co-parent', null, 'Mother of proband and sibling'],
    ['sibling', 'partner', 'unrelated', null, 'Not a blood relative'],
  ] as const)('%s → %s is %s (degree %s, "%s")', (from, to, relation, degree, label) => {
    expect(k(from, to)).toEqual({ relation, degree, label })
  })

  it('distinguishes half-siblings (one shared parent) as second degree', () => {
    const withHalfSibling = [
      ...people,
      { ...people[0]!, id: 'half', parentIds: ['proband'], sex: 'female' as const },
    ]
    expect(kinship(withHalfSibling, 'child', 'half')).toEqual({
      relation: 'half-sibling',
      degree: 2,
      label: 'Half-sister',
    })
  })

  it('treats co-parents who married in as not blood-related', () => {
    expect(isBloodRelative(k('proband', 'partner'))).toBe(false)
    expect(isBloodRelative(k('proband', 'child'))).toBe(true)
  })

  it('throws for unknown people', () => {
    expect(() => k('proband', 'nobody')).toThrow(/Unknown person/)
  })
})
