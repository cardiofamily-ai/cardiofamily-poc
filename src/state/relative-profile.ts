import type { FamilyAction } from '@/domain/actions/types'
import type { GenotypeSummary } from '@/domain/genetics/genotype'
import type { GeneticTest } from '@/domain/genetics/types'
import type { PersonSummary } from '@/domain/person-summary'
import type { PhenotypeAssessment } from '@/domain/phenotype/types'
import type { ImpactReason } from '@/domain/reclassification/impact'
import type { RelativeStatus } from '@/domain/relative-status'
import type { SurveillancePlan } from '@/domain/surveillance/types'
import type { FamilyOverview, PendingReclassification } from './caseload'
import { primaryAction } from './display-priority'

export interface RelativeProfile {
  readonly family: FamilyOverview
  readonly summary: PersonSummary
  readonly status: RelativeStatus
  /** Open actions for this person, in engine priority order. */
  readonly actions: readonly FamilyAction[]
  /** The action shown first as NEXT ACTION (display priority, see primaryAction). */
  readonly nextAction: FamilyAction | undefined
  readonly genotype: GenotypeSummary
  /** Newest first. */
  readonly tests: readonly GeneticTest[]
  readonly assessments: readonly PhenotypeAssessment[]
  readonly plans: readonly SurveillancePlan[]
  /** Unacknowledged reclassifications that may affect this person, with reasons. */
  readonly pendingImpacts: readonly { readonly pending: PendingReclassification; readonly reasons: readonly ImpactReason[] }[]
}

const testDate = (t: GeneticTest) => (t.status === 'resulted' ? t.resultDate : t.requestedDate)

export function buildRelativeProfile(family: FamilyOverview, personId: string): RelativeProfile | undefined {
  const summary = family.people.find((p) => p.person.id === personId)
  if (!summary) return undefined
  const { snapshot } = family
  const actions = family.actions.filter((a) => a.personId === personId)

  return {
    family,
    summary,
    status: family.relativeStatuses[personId]!,
    actions,
    nextAction: primaryAction(actions),
    genotype: summary.genotypes.find((g) => g.variantId === family.variant.id) ?? { status: 'untested' },
    tests: snapshot.geneticTests
      .filter((t) => t.personId === personId)
      .toSorted((a, b) => testDate(b).localeCompare(testDate(a))),
    assessments: snapshot.phenotypeAssessments
      .filter((a) => a.personId === personId)
      .toSorted((a, b) => b.date.localeCompare(a.date)),
    plans: snapshot.surveillancePlans.filter((p) => p.personId === personId),
    pendingImpacts: family.pendingReclassifications.flatMap((pending) => {
      const affected = pending.impact.affectedPeople.find((p) => p.personId === personId)
      return affected ? [{ pending, reasons: affected.reasons }] : []
    }),
  }
}
