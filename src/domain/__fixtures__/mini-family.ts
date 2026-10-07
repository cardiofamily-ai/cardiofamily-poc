/**
 * Minimal synthetic family for domain unit tests. Domain tests do not use the
 * demo seed data, so rule behaviour is tested independently of the story.
 *
 *   Grandpa ═╤═ Grandma
 *       ┌────┴────┐
 *   Proband* ═╤═ Partner    Sibling
 *         ┌───┴───┐
 *       Child    Child2
 */
import type { Person } from '@/domain/family/types'
import type { FamilySnapshot } from '@/domain/snapshot'
import { toIsoDate as d } from '@/domain/time'

export const TODAY = d('2026-10-01')
export const VARIANT_ID = 'var-mini'

const person = (
  id: string,
  sex: 'female' | 'male',
  dateOfBirth: string,
  parentIds: string[] = [],
): Person => ({
  id,
  familyId: 'fam-mini',
  givenName: id,
  familyName: 'Mini',
  sex,
  dateOfBirth: d(dateOfBirth),
  parentIds,
  synthetic: true,
})

export function miniFamily(overrides: Partial<FamilySnapshot> = {}): FamilySnapshot {
  return {
    family: {
      id: 'fam-mini',
      name: 'Mini family',
      displayCode: 'SYN-TEST',
      probandId: 'proband',
      centre: 'Test centre (fictional)',
      synthetic: true,
    },
    people: [
      person('grandpa', 'male', '1950-01-01'),
      person('grandma', 'female', '1952-01-01'),
      person('proband', 'female', '1980-01-01', ['grandpa', 'grandma']),
      person('sibling', 'male', '1983-01-01', ['grandpa', 'grandma']),
      person('partner', 'male', '1979-01-01'),
      person('child', 'female', '2010-01-01', ['proband', 'partner']),
      person('child2', 'male', '2012-01-01', ['proband', 'partner']),
    ],
    variants: [{ id: VARIANT_ID, familyId: 'fam-mini', gene: 'MYBPC3', syntheticLabel: 'SYN-TEST-1', synthetic: true }],
    interpretations: [
      { id: 'int-1', variantId: VARIANT_ID, classification: 'pathogenic', effectiveDate: d('2025-01-01'),
        laboratory: 'Test lab (fictional)', reportReference: 'SYN-T-1' },
    ],
    geneticTests: [
      { id: 'gt-proband', personId: 'proband', variantId: VARIANT_ID, kind: 'diagnostic',
        requestedDate: d('2024-12-01'), status: 'resulted', resultDate: d('2025-01-01'), outcome: 'detected' },
    ],
    phenotypeAssessments: [],
    surveillancePlans: [
      { id: 'sp-proband', personId: 'proband', description: 'Test plan', status: 'active', nextDueDate: d('2027-01-01') },
    ],
    reclassificationEvents: [],
    ...overrides,
  }
}

export function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const child of Object.values(value)) deepFreeze(child)
  }
  return value
}
