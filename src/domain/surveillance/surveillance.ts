import type { PersonId } from '@/domain/family/types'
import { dueStateOn, type DueState, type IsoDate } from '@/domain/time'
import type { SurveillancePlan } from './types'

export type SurveillanceState = DueState | 'none'

export interface SurveillanceSummary {
  readonly state: SurveillanceState
  readonly plan?: SurveillancePlan
}

export function activeSurveillancePlan(
  plans: readonly SurveillancePlan[],
  personId: PersonId,
): SurveillancePlan | undefined {
  return plans
    .filter((p) => p.personId === personId && p.status === 'active')
    .toSorted((a, b) => a.nextDueDate.localeCompare(b.nextDueDate) || a.id.localeCompare(b.id))
    .at(0)
}

export function surveillanceStatus(
  plans: readonly SurveillancePlan[],
  personId: PersonId,
  today: IsoDate,
): SurveillanceSummary {
  const plan = activeSurveillancePlan(plans, personId)
  return plan ? { state: dueStateOn(plan.nextDueDate, today), plan } : { state: 'none' }
}
