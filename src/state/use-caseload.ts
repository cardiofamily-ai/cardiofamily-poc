import { useMemo } from 'react'
import { SYNTHETIC_FAMILIES } from '@/data/synthetic'
import { useClock } from './clock-context'
import { buildCaseload, type Caseload } from './caseload'
import { buildRelativeProfile } from './relative-profile'

/** Reclassification acknowledgement becomes session state in a later phase. */
const NO_ACKNOWLEDGEMENTS: readonly string[] = []

export function useCaseload(): Caseload {
  const clock = useClock()
  const today = clock.today()
  return useMemo(
    () => buildCaseload(SYNTHETIC_FAMILIES, { today, acknowledgedReclassificationIds: NO_ACKNOWLEDGEMENTS }),
    [today],
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
