import type { FamilyId, PersonId } from '@/domain/family/types'
import type { IsoDate } from '@/domain/time'

export type VariantId = string
export type Gene = 'MYBPC3' | 'MYH7'

/**
 * Laboratory-reported classification. CardioFamily never computes a
 * classification; it only records what a (synthetic) laboratory reported.
 */
export type Classification = 'pathogenic' | 'likely-pathogenic' | 'vus' | 'likely-benign' | 'benign'

export interface Variant {
  readonly id: VariantId
  readonly familyId: FamilyId
  readonly gene: Gene
  /** Synthetic designation, e.g. "SYN-VAR-001". Not a real HGVS description. */
  readonly syntheticLabel: string
  readonly synthetic: true
}

export interface VariantInterpretation {
  readonly id: string
  readonly variantId: VariantId
  readonly classification: Classification
  readonly effectiveDate: IsoDate
  /** Fictional laboratory. */
  readonly laboratory: string
  readonly reportReference: string
}

interface GeneticTestBase {
  readonly id: string
  readonly personId: PersonId
  readonly variantId: VariantId
  /** Diagnostic: first test in the family. Cascade: targeted test for a known familial variant. */
  readonly kind: 'diagnostic' | 'cascade'
  readonly requestedDate: IsoDate
}

export interface PendingGeneticTest extends GeneticTestBase {
  readonly status: 'offered' | 'sample-pending'
  /** Seeded expected result date, if recorded. */
  readonly expectedResultDate?: IsoDate
}

export interface DeclinedGeneticTest extends GeneticTestBase {
  readonly status: 'declined'
}

export interface ResultedGeneticTest extends GeneticTestBase {
  readonly status: 'resulted'
  readonly resultDate: IsoDate
  readonly outcome: 'detected' | 'not-detected'
}

export type GeneticTest = PendingGeneticTest | DeclinedGeneticTest | ResultedGeneticTest
