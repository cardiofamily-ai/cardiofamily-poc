import type { FamilyId, Person, PersonId, Sex } from '@/domain/family/types'
import { toIsoDate } from '@/domain/time'

/** Returns a concise constructor for synthetic people in one family. */
export function personFactory(familyId: FamilyId) {
  return (
    id: PersonId,
    givenName: string,
    familyName: string,
    sex: Sex,
    dateOfBirth: string,
    parentIds: PersonId[] = [],
  ): Person => ({
    id,
    familyId,
    givenName,
    familyName,
    sex,
    dateOfBirth: toIsoDate(dateOfBirth),
    parentIds,
    synthetic: true,
  })
}
