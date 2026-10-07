import { kinship, type Kinship } from '@/domain/family/kinship'
import type { Person, PersonId } from '@/domain/family/types'
import { genotypeStatus, type GenotypeSummary } from '@/domain/genetics/genotype'
import { phenotypeStatus, type PhenotypeSummary } from '@/domain/phenotype/phenotype'
import { findPerson, type FamilySnapshot } from '@/domain/snapshot'
import { surveillanceStatus, type SurveillanceSummary } from '@/domain/surveillance/surveillance'
import type { IsoDate } from '@/domain/time'

export interface PersonSummary {
  readonly person: Person
  readonly isProband: boolean
  readonly relationshipToProband: Kinship
  /** Genotype for each family variant, in snapshot order. */
  readonly genotypes: readonly (GenotypeSummary & { readonly variantId: string })[]
  readonly phenotype: PhenotypeSummary
  readonly surveillance: SurveillanceSummary
}

export function summarisePerson(
  snapshot: FamilySnapshot,
  personId: PersonId,
  today: IsoDate,
): PersonSummary {
  const person = findPerson(snapshot, personId)
  return {
    person,
    isProband: snapshot.family.probandId === personId,
    relationshipToProband: kinship(snapshot.people, snapshot.family.probandId, personId),
    genotypes: snapshot.variants.map((variant) => ({
      variantId: variant.id,
      ...genotypeStatus(snapshot.geneticTests, personId, variant.id),
    })),
    phenotype: phenotypeStatus(snapshot.phenotypeAssessments, personId),
    surveillance: surveillanceStatus(snapshot.surveillancePlans, personId, today),
  }
}
