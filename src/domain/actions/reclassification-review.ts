import { CLASSIFICATION_LABELS } from '@/domain/genetics/interpretation'
import { assessReclassificationImpact, type ImpactReason } from '@/domain/reclassification/impact'
import type { ReclassificationEvent } from '@/domain/reclassification/types'
import { findPerson, type FamilySnapshot } from '@/domain/snapshot'
import type { IsoDate } from '@/domain/time'
import { createAction, DEMO_RULES, interpretationEvidence } from './rules'
import type { Evidence, FamilyAction } from './types'

function reasonEvidence(snapshot: FamilySnapshot, reason: ImpactReason): Evidence {
  switch (reason.kind) {
    case 'action-raised':
      return {
        statement: `Would newly raise ${reason.action.ruleId} (${DEMO_RULES[reason.action.ruleId].title}): ${reason.action.what}.`,
        source: { kind: 'action', id: reason.action.id },
      }
    case 'action-resolved':
      return {
        statement: `Would no longer raise ${reason.action.ruleId} (${DEMO_RULES[reason.action.ruleId].title}).`,
        source: { kind: 'action', id: reason.action.id },
      }
    case 'surveillance-plan': {
      const plan = snapshot.surveillancePlans.find((p) => p.id === reason.planId)
      return {
        statement: `Active surveillance plan (next due ${plan?.nextDueDate}) was arranged under the previous classification.`,
        source: { kind: 'surveillance-plan', id: reason.planId },
      }
    }
    case 'test-result':
      return {
        statement: 'Has a recorded test result for this variant; its interpretation changes.',
        source: { kind: 'genetic-test', id: reason.testId },
      }
  }
}

/** DEMO-R-006: one clinician-review action per potentially affected person. */
export function reclassificationReviewActions(
  snapshot: FamilySnapshot,
  event: ReclassificationEvent,
  today: IsoDate,
): FamilyAction[] {
  const impact = assessReclassificationImpact(snapshot, event, today)
  const variant = snapshot.variants.find((v) => v.id === event.variantId)
  if (!variant) throw new Error(`Reclassification ${event.id}: variant not found`)

  const change = `${CLASSIFICATION_LABELS[impact.from]} → ${CLASSIFICATION_LABELS[impact.to]}`
  return impact.affectedPeople.map(({ personId, reasons }) =>
    createAction({
      ruleId: 'DEMO-R-006',
      snapshot,
      person: findPerson(snapshot, personId),
      subjectId: event.id,
      category: 'reclassification-review',
      what: 'Clinician review: variant reclassification may affect testing or surveillance pathway',
      when: { kind: 'unscheduled' },
      raisedOn: event.receivedDate,
      summary: `Laboratory reclassification received (${change}); not yet acknowledged by a clinician. No pathway changes have been applied.`,
      evidence: [
        {
          statement: `Reclassification report received ${event.receivedDate}: ${change}.`,
          source: { kind: 'reclassification-event', id: event.id },
        },
        interpretationEvidence(variant, event.newInterpretation),
        ...reasons.map((reason) => reasonEvidence(snapshot, reason)),
      ],
    }),
  )
}
