import type { PersonId } from '@/domain/family/types'
import type { PhenotypeAssessment, PhenotypeFinding } from './types'

export type PhenotypeStatus = PhenotypeFinding | 'not-assessed'

export interface PhenotypeSummary {
  readonly status: PhenotypeStatus
  readonly latest?: PhenotypeAssessment
}

/** Status is the finding of the most recent recorded assessment. */
export function phenotypeStatus(
  assessments: readonly PhenotypeAssessment[],
  personId: PersonId,
): PhenotypeSummary {
  const latest = assessments
    .filter((a) => a.personId === personId)
    .toSorted((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
    .at(-1)
  return latest ? { status: latest.finding, latest } : { status: 'not-assessed' }
}
