/**
 * Descriptive family/genetic status of a person, shown under RISK.
 *
 * This is a demonstration categorisation of already-recorded states
 * (relationship, genotype, phenotype, testing and the laboratory
 * classification). It does not estimate penetrance, probability or future
 * disease risk, and it adds no clinical inference.
 */
import { isBloodRelative } from '@/domain/family/kinship'
import { CLASSIFICATION_LABELS, isPathogenicOrLikelyPathogenic } from '@/domain/genetics/interpretation'
import type { GenotypeSummary } from '@/domain/genetics/genotype'
import type { Classification, VariantId } from '@/domain/genetics/types'
import type { PersonSummary } from '@/domain/person-summary'

export type RelativeStatusCategory =
  | 'genotype-positive-phenotype-positive'
  | 'genotype-positive-no-phenotype'
  | 'at-risk-not-tested'
  | 'at-risk-result-pending'
  | 'at-risk-testing-declined'
  | 'familial-variant-not-detected'
  | 'vus-detected'
  | 'not-blood-relative'
  /** Fallback when none of the above applies (e.g. deceased, benign classification). */
  | 'not-categorised'

export interface RelativeStatus {
  readonly category: RelativeStatusCategory
  /** The recorded facts the category was derived from, in plain language. */
  readonly basis: readonly string[]
}

const DEGREE = ['', 'first', 'second', 'third']

/** `classification` is the last clinician-acknowledged classification of the familial variant. */
export function categoriseRelative(
  summary: PersonSummary,
  variantId: VariantId,
  classification: Classification,
): RelativeStatus {
  const kin = summary.relationshipToProband
  if (!isBloodRelative(kin)) {
    return {
      category: 'not-blood-relative',
      basis: [`${kin.label}; not a blood relative of the proband.`],
    }
  }

  const basis: string[] = [
    summary.isProband
      ? 'Proband of this family.'
      : `${kin.label} of the proband (${DEGREE[kin.degree!] ?? `degree ${kin.degree}`}-degree relative).`,
  ]
  if (summary.person.deceasedDate) {
    return { category: 'not-categorised', basis: [...basis, `Deceased (${summary.person.deceasedDate}); not categorised.`] }
  }

  const genotype: GenotypeSummary = summary.genotypes.find((g) => g.variantId === variantId) ?? { status: 'untested' }
  const test = genotype.test
  basis.push(`Last acknowledged classification of the familial variant: ${CLASSIFICATION_LABELS[classification]}.`)

  switch (genotype.status) {
    case 'positive': {
      basis.push(`Familial variant detected${test?.status === 'resulted' ? ` (result ${test.resultDate})` : ''}.`)
      const { status, latest } = summary.phenotype
      basis.push(
        status === 'present'
          ? `Phenotype recorded as present (${latest!.date}).`
          : latest
            ? `No phenotype recorded (latest assessment ${latest.date}).`
            : 'No phenotype assessment recorded.',
      )
      if (classification === 'vus') return { category: 'vus-detected', basis }
      if (!isPathogenicOrLikelyPathogenic(classification)) return { category: 'not-categorised', basis }
      return {
        category: status === 'present' ? 'genotype-positive-phenotype-positive' : 'genotype-positive-no-phenotype',
        basis,
      }
    }
    case 'negative':
      basis.push(`Familial variant not detected${test?.status === 'resulted' ? ` (result ${test.resultDate})` : ''}.`)
      return { category: 'familial-variant-not-detected', basis }
    case 'pending':
      basis.push(`Genetic test for the familial variant requested ${test!.requestedDate}; result pending.`)
      return { category: 'at-risk-result-pending', basis }
    case 'declined':
      basis.push(`Genetic testing for the familial variant recorded as declined (${test!.requestedDate}).`)
      return { category: 'at-risk-testing-declined', basis }
    case 'untested':
      basis.push('No genetic test for the familial variant recorded.')
      return { category: 'at-risk-not-tested', basis }
  }
}
