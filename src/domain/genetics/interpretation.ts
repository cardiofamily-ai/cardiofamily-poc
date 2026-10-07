import type { IsoDate } from '@/domain/time'
import type { Classification, VariantId, VariantInterpretation } from './types'

export const CLASSIFICATION_LABELS: Record<Classification, string> = {
  pathogenic: 'Pathogenic',
  'likely-pathogenic': 'Likely pathogenic',
  vus: 'Variant of uncertain significance',
  'likely-benign': 'Likely benign',
  benign: 'Benign',
}

export function isPathogenicOrLikelyPathogenic(classification: Classification): boolean {
  return classification === 'pathogenic' || classification === 'likely-pathogenic'
}

/** All interpretations of a variant, oldest first. */
export function interpretationHistory(
  interpretations: readonly VariantInterpretation[],
  variantId: VariantId,
): VariantInterpretation[] {
  return interpretations
    .filter((i) => i.variantId === variantId)
    .toSorted((a, b) => a.effectiveDate.localeCompare(b.effectiveDate) || a.id.localeCompare(b.id))
}

/** The most recent interpretation effective on or before `today`. */
export function currentInterpretation(
  interpretations: readonly VariantInterpretation[],
  variantId: VariantId,
  today: IsoDate,
): VariantInterpretation | undefined {
  return interpretationHistory(interpretations, variantId)
    .filter((i) => i.effectiveDate <= today)
    .at(-1)
}
