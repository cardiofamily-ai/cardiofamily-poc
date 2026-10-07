import type { PersonId } from '@/domain/family/types'
import type { IsoDate } from '@/domain/time'

/**
 * A seeded surveillance arrangement. Dates come from synthetic seed data;
 * no surveillance intervals are calculated or encoded by CardioFamily.
 */
export interface SurveillancePlan {
  readonly id: string
  readonly personId: PersonId
  readonly description: string
  readonly status: 'active' | 'ended'
  readonly lastReviewDate?: IsoDate
  readonly nextDueDate: IsoDate
}
