/** Display wording for domain statuses. Presentation only — no logic. */
import type { GenotypeStatus, GenotypeSummary } from '@/domain/genetics/genotype'
import type { Classification } from '@/domain/genetics/types'
import type { PhenotypeStatus } from '@/domain/phenotype/phenotype'
import type { RelativeStatusCategory } from '@/domain/relative-status'
import type { ReviewStatus } from '@/domain/review'
import type { SurveillanceState } from '@/domain/surveillance/surveillance'
import { formatDisplayDate } from '@/lib/format'

export const GENOTYPE_TEXT: Record<GenotypeStatus, string> = {
  positive: 'Genotype positive',
  negative: 'Genotype negative',
  pending: 'Result pending',
  declined: 'Testing declined',
  untested: 'Untested',
}

export const GENOTYPE_SHORT: Record<GenotypeStatus, string> = {
  positive: 'G+',
  negative: 'G−',
  pending: 'Pending',
  declined: 'Declined',
  untested: 'Untested',
}

export const PHENOTYPE_TEXT: Record<PhenotypeStatus, string> = {
  present: 'Phenotype present',
  absent: 'No phenotype recorded',
  inconclusive: 'Inconclusive',
  'not-assessed': 'Not assessed',
}

export const SURVEILLANCE_TEXT: Record<SurveillanceState, string> = {
  overdue: 'Overdue',
  upcoming: 'Scheduled',
  none: 'No active plan',
}

export const CLASSIFICATION_SHORT: Record<Classification, string> = {
  pathogenic: 'Pathogenic',
  'likely-pathogenic': 'Likely pathogenic',
  vus: 'VUS',
  'likely-benign': 'Likely benign',
  benign: 'Benign',
}

export const MODALITY_TEXT = {
  echocardiogram: 'Echocardiogram',
  'cardiac-mri': 'Cardiac MRI',
  ecg: 'ECG',
} as const

/** e.g. "Cascade test · resulted 20 May 2025" */
export function testingText(genotype: GenotypeSummary): string {
  const test = genotype.test
  if (!test) return 'No test recorded'
  const kind = test.kind === 'diagnostic' ? 'Diagnostic test' : 'Cascade test'
  switch (test.status) {
    case 'resulted':
      return `${kind} · resulted ${formatDisplayDate(test.resultDate)}`
    case 'declined':
      return `${kind} · declined`
    case 'offered':
    case 'sample-pending': {
      const status = test.status === 'offered' ? 'offered' : 'sample pending'
      return test.expectedResultDate
        ? `${kind} · ${status} · expected ${formatDisplayDate(test.expectedResultDate)}`
        : `${kind} · ${status}`
    }
  }
}

/** RISK labels: descriptive status only. Wording agreed for the demonstration. */
export const RELATIVE_STATUS_TEXT: Record<RelativeStatusCategory, string> = {
  'genotype-positive-phenotype-positive': 'Genotype-positive / phenotype-positive',
  'genotype-positive-no-phenotype': 'Genotype-positive / no phenotype recorded',
  'at-risk-not-tested': 'At-risk relative / not yet tested',
  'at-risk-result-pending': 'At-risk relative / result pending',
  'at-risk-testing-declined': 'At-risk relative / testing declined',
  'familial-variant-not-detected': 'Familial variant not detected',
  'vus-detected': 'Variant of uncertain significance detected',
  'not-blood-relative': 'Not a blood relative',
  'not-categorised': 'Not categorised',
}

export const REVIEW_STATUS_TEXT: Record<ReviewStatus, string> = {
  'pending-clinician-review': 'Pending clinician review',
  reviewed: 'Reviewed',
  deferred: 'Deferred',
  'not-applicable': 'Not applicable',
}
