import type { FamilyId } from '@/domain/family/types'
import type { VariantId, VariantInterpretation } from '@/domain/genetics/types'
import type { IsoDate } from '@/domain/time'

/**
 * A (synthetic) laboratory report that changes a variant's classification.
 * Received reports are not applied to the family's pathways until a
 * clinician acknowledges the impact review (DEMO-R-006).
 */
export interface ReclassificationEvent {
  readonly id: string
  readonly familyId: FamilyId
  readonly variantId: VariantId
  /** The interpretation in force when the report arrived. */
  readonly previousInterpretationId: string
  readonly newInterpretation: VariantInterpretation
  readonly receivedDate: IsoDate
}
