import { useMemo } from 'react'
import { SYNTHETIC_FAMILIES } from '@/data/synthetic'
import { useClock } from './clock-context'
import { buildCaseload, findAction, type Caseload } from './caseload'
import { buildRelativeProfile } from './relative-profile'
import { useDemoSession } from './session-context'

export function useCaseload(): Caseload {
  const today = useClock().today()
  const { reviews, actionLog } = useDemoSession()
  return useMemo(
    () => buildCaseload(SYNTHETIC_FAMILIES, { today, reviews, actionLog }),
    [today, reviews, actionLog],
  )
}

export function useFamilyOverview(familyId: string | undefined) {
  const caseload = useCaseload()
  return caseload.families.find((f) => f.snapshot.family.id === familyId)
}

export function useRelativeProfile(familyId: string | undefined, personId: string | undefined) {
  const family = useFamilyOverview(familyId)
  return family && personId ? buildRelativeProfile(family, personId) : undefined
}

/** A received reclassification event with its family context. */
export function useReclassification(eventId: string | undefined) {
  const caseload = useCaseload()
  for (const family of caseload.families) {
    const item = family.reclassifications.find((r) => r.event.id === eventId)
    if (item) return { family, item }
  }
  return undefined
}

/** Any engine action (outstanding or closed) with its family and person. */
export function useAction(actionId: string | undefined) {
  const caseload = useCaseload()
  return actionId ? findAction(caseload, actionId) : undefined
}
