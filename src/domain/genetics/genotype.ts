import type { PersonId } from '@/domain/family/types'
import type { GeneticTest, VariantId } from './types'

/** Status of a person with respect to one familial variant. */
export type GenotypeStatus = 'positive' | 'negative' | 'pending' | 'declined' | 'untested'

export interface GenotypeSummary {
  readonly status: GenotypeStatus
  /** The test the status was derived from. */
  readonly test?: GeneticTest
}

function testDate(test: GeneticTest) {
  return test.status === 'resulted' ? test.resultDate : test.requestedDate
}

/** Derived from the most recent test for this variant. */
export function genotypeStatus(
  tests: readonly GeneticTest[],
  personId: PersonId,
  variantId: VariantId,
): GenotypeSummary {
  const latest = tests
    .filter((t) => t.personId === personId && t.variantId === variantId)
    .toSorted((a, b) => testDate(a).localeCompare(testDate(b)) || a.id.localeCompare(b.id))
    .at(-1)

  if (!latest) return { status: 'untested' }
  switch (latest.status) {
    case 'resulted':
      return { status: latest.outcome === 'detected' ? 'positive' : 'negative', test: latest }
    case 'declined':
      return { status: 'declined', test: latest }
    case 'offered':
    case 'sample-pending':
      return { status: 'pending', test: latest }
  }
}
