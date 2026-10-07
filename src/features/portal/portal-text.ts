/**
 * Relative-facing wording for the portal preview. Plain language, no medical
 * advice: it only restates the relative's own recorded status and whether
 * the care team has an open workflow item for them.
 */
import type { ActionCategory } from '@/domain/actions/types'
import type { GenotypeStatus } from '@/domain/genetics/genotype'

export const NEXT_STEP_TEXT: Record<ActionCategory | 'none', string> = {
  surveillance: 'Your care team may contact you about arranging your next heart screening.',
  'cascade-testing': 'Your care team may contact you to talk about genetic testing for the change found in your family.',
  'genetic-interpretation': 'Your care team is reviewing genetic information about your family and may contact you.',
  'reclassification-review': 'Your care team is reviewing new genetic information about your family and may contact you.',
  none: 'There is nothing you need to do right now. Your care team will contact you if anything changes.',
}

export const TESTING_TEXT: Record<GenotypeStatus, string> = {
  positive: 'Your test found the genetic change that was identified in your family.',
  negative: 'Your test did not find the genetic change that was identified in your family.',
  pending: 'Your test result is not available yet.',
  declined: 'You chose not to have genetic testing at this time.',
  untested: 'No genetic test has been recorded for you.',
}
