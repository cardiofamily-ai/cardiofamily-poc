import type { Family, Person, PersonId } from '@/domain/family/types'
import type { GeneticTest, Variant, VariantInterpretation } from '@/domain/genetics/types'
import type { PhenotypeAssessment } from '@/domain/phenotype/types'
import type { ReclassificationEvent } from '@/domain/reclassification/types'
import type { SurveillancePlan } from '@/domain/surveillance/types'

/** Everything known about one family. The unit the rule engine evaluates. */
export interface FamilySnapshot {
  readonly family: Family
  readonly people: readonly Person[]
  readonly variants: readonly Variant[]
  readonly interpretations: readonly VariantInterpretation[]
  readonly geneticTests: readonly GeneticTest[]
  readonly phenotypeAssessments: readonly PhenotypeAssessment[]
  readonly surveillancePlans: readonly SurveillancePlan[]
  readonly reclassificationEvents: readonly ReclassificationEvent[]
}

export function findPerson(snapshot: FamilySnapshot, personId: PersonId): Person {
  const person = snapshot.people.find((p) => p.id === personId)
  if (!person) throw new Error(`Person ${personId} not found in ${snapshot.family.id}`)
  return person
}

export function getProband(snapshot: FamilySnapshot): Person {
  return findPerson(snapshot, snapshot.family.probandId)
}

export function fullName(person: Person): string {
  return `${person.givenName} ${person.familyName}`
}

export function isLiving(person: Person): boolean {
  return person.deceasedDate === undefined
}
