import type { PersonId } from '@/domain/family/types'
import type { IsoDate } from '@/domain/time'

/**
 * Finding as recorded by a (synthetic) clinician. CardioFamily does not
 * interpret imaging or apply diagnostic criteria.
 */
export type PhenotypeFinding = 'present' | 'absent' | 'inconclusive'

export interface PhenotypeAssessment {
  readonly id: string
  readonly personId: PersonId
  readonly date: IsoDate
  readonly modality: 'echocardiogram' | 'cardiac-mri' | 'ecg'
  readonly finding: PhenotypeFinding
}
