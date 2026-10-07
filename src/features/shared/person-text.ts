import type { Person } from '@/domain/family/types'
import type { PersonSummary } from '@/domain/person-summary'
import { fullName } from '@/domain/snapshot'
import { ageOn, type IsoDate } from '@/domain/time'

export { fullName }

/** "Proband", or the derived relationship to the proband, e.g. "Brother". */
export function relationshipText(summary: PersonSummary): string {
  return summary.isProband ? 'Proband' : summary.relationshipToProband.label
}

/** "45 y", or "† 2004" for a deceased person. */
export function ageText(person: Person, today: IsoDate): string {
  if (person.deceasedDate) return `† ${person.deceasedDate.slice(0, 4)}`
  return `${ageOn(person.dateOfBirth, today)} y`
}

export function sexText(person: Person): string {
  return person.sex === 'male' ? 'Male' : 'Female'
}
