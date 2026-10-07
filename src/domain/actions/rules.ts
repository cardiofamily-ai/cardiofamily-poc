/**
 * Synthetic demonstration rules DEMO-R-001 … DEMO-R-005.
 *
 * These rules demonstrate workflow mechanics over seeded state only. They are
 * NOT clinical guidance: they encode no surveillance intervals, age
 * thresholds or management recommendations. DEMO-R-006 lives in
 * reclassification-review.ts because it depends on impact assessment.
 */
import { isBloodRelative, kinship } from '@/domain/family/kinship'
import type { Person } from '@/domain/family/types'
import { genotypeStatus } from '@/domain/genetics/genotype'
import {
  CLASSIFICATION_LABELS,
  currentInterpretation,
  isPathogenicOrLikelyPathogenic,
} from '@/domain/genetics/interpretation'
import type { Variant, VariantInterpretation } from '@/domain/genetics/types'
import { DEMO_ACTION_DISCLAIMER, DEMO_RULE_NOTICE } from '@/domain/safety'
import { fullName, isLiving, type FamilySnapshot } from '@/domain/snapshot'
import { activeSurveillancePlan } from '@/domain/surveillance/surveillance'
import { dueStateOn, type IsoDate } from '@/domain/time'
import type { ActionCategory, ActionTiming, DemoRule, DemoRuleId, Evidence, FamilyAction } from './types'

export const ENGINE_VERSION = 'demo-engine 0.1.0'

export const DEMO_RULES: Record<DemoRuleId, DemoRule> = {
  'DEMO-R-001': {
    id: 'DEMO-R-001',
    version: '1.0',
    title: 'Cascade testing consideration',
    trigger:
      'A living blood relative of the proband who is also a first-degree relative of a genotype-positive person has no recorded test for the familial variant, and the variant is currently classified Pathogenic or Likely pathogenic. Parents who married into the family (not blood relatives of the proband) are not included.',
    notice: DEMO_RULE_NOTICE,
  },
  'DEMO-R-002': {
    id: 'DEMO-R-002',
    version: '1.0',
    title: 'Pending cascade test follow-up',
    trigger:
      'A cascade test is recorded as offered or sample pending. The due date is the seeded expected result date, when one is recorded.',
    notice: DEMO_RULE_NOTICE,
  },
  'DEMO-R-003': {
    id: 'DEMO-R-003',
    version: '1.0',
    title: 'Overdue surveillance',
    trigger: 'An active surveillance plan has a seeded next due date before the demo date.',
    notice: DEMO_RULE_NOTICE,
  },
  'DEMO-R-004': {
    id: 'DEMO-R-004',
    version: '1.0',
    title: 'Genotype-positive without surveillance plan',
    trigger:
      'A living person is genotype positive for a variant currently classified Pathogenic or Likely pathogenic and has no active surveillance plan recorded.',
    notice: DEMO_RULE_NOTICE,
  },
  'DEMO-R-005': {
    id: 'DEMO-R-005',
    version: '1.0',
    title: 'Variant of uncertain significance',
    trigger:
      'A living person is genotype positive for a variant currently classified as a VUS. Under these demonstration rules a VUS does not prompt cascade testing (see DEMO-R-001).',
    notice: DEMO_RULE_NOTICE,
  },
  'DEMO-R-006': {
    id: 'DEMO-R-006',
    version: '1.0',
    title: 'Reclassification impact review',
    trigger:
      'A laboratory reclassification has been received but not yet acknowledged by a clinician, and the person’s demonstration pathway would change, they have an active surveillance plan, or they have a test result for the variant. No pathway changes are applied until the review is acknowledged.',
    notice: DEMO_RULE_NOTICE,
  },
}

interface ActionInput {
  ruleId: DemoRuleId
  snapshot: FamilySnapshot
  person: Person
  subjectId: string
  category: ActionCategory
  what: string
  when: ActionTiming
  raisedOn: IsoDate
  summary: string
  evidence: Evidence[]
}

export function createAction(input: ActionInput): FamilyAction {
  return {
    id: `${input.ruleId}:${input.person.id}:${input.subjectId}`,
    ruleId: input.ruleId,
    ruleVersion: DEMO_RULES[input.ruleId].version,
    engineVersion: ENGINE_VERSION,
    familyId: input.snapshot.family.id,
    personId: input.person.id,
    category: input.category,
    what: input.what,
    when: input.when,
    raisedOn: input.raisedOn,
    why: { summary: input.summary, evidence: input.evidence },
    status: 'pending-clinician-review',
    demonstrationOnly: true,
    requiresClinicianReview: true,
    disclaimer: DEMO_ACTION_DISCLAIMER,
  }
}

export function variantLabel(variant: Variant): string {
  return `${variant.gene} ${variant.syntheticLabel}`
}

export function interpretationEvidence(
  variant: Variant,
  interpretation: VariantInterpretation,
): Evidence {
  return {
    statement: `${variantLabel(variant)} classified ${CLASSIFICATION_LABELS[interpretation.classification]} by ${interpretation.laboratory} (${interpretation.reportReference}, ${interpretation.effectiveDate}).`,
    source: { kind: 'variant-interpretation', id: interpretation.id },
  }
}

function describe(snapshot: FamilySnapshot, person: Person): string {
  return person.id === snapshot.family.probandId ? `${fullName(person)} (proband)` : fullName(person)
}

interface VariantContext {
  variant: Variant
  interpretation: VariantInterpretation
  carriers: { person: Person; resultDate: IsoDate; testId: string }[]
}

function variantContexts(snapshot: FamilySnapshot, today: IsoDate): VariantContext[] {
  return snapshot.variants.flatMap((variant) => {
    const interpretation = currentInterpretation(snapshot.interpretations, variant.id, today)
    if (!interpretation) return []
    const carriers = snapshot.people.flatMap((person) => {
      const { status, test } = genotypeStatus(snapshot.geneticTests, person.id, variant.id)
      return status === 'positive' && test?.status === 'resulted'
        ? [{ person, resultDate: test.resultDate, testId: test.id }]
        : []
    })
    return [{ variant, interpretation, carriers }]
  })
}

/** DEMO-R-001 */
function cascadeTestingConsideration(snapshot: FamilySnapshot, today: IsoDate): FamilyAction[] {
  return variantContexts(snapshot, today).flatMap(({ variant, interpretation, carriers }) => {
    if (!isPathogenicOrLikelyPathogenic(interpretation.classification)) return []
    return snapshot.people.filter(isLiving).flatMap((person) => {
      if (genotypeStatus(snapshot.geneticTests, person.id, variant.id).status !== 'untested') return []
      if (!isBloodRelative(kinship(snapshot.people, snapshot.family.probandId, person.id))) return []
      const related = carriers.filter(
        (c) => kinship(snapshot.people, c.person.id, person.id).degree === 1,
      )
      if (related.length === 0) return []
      return [
        createAction({
          ruleId: 'DEMO-R-001',
          snapshot,
          person,
          subjectId: variant.id,
          category: 'cascade-testing',
          what: 'Consider offering cascade genetic testing for the familial variant',
          when: { kind: 'unscheduled' },
          raisedOn: related.map((c) => c.resultDate).toSorted().at(-1) as IsoDate,
          summary: `First-degree relative of a genotype-positive family member; no test for ${variantLabel(variant)} is recorded.`,
          evidence: [
            interpretationEvidence(variant, interpretation),
            ...related.map(({ person: carrier, testId }) => ({
              statement: `${kinship(snapshot.people, carrier.id, person.id).label} of ${describe(snapshot, carrier)}, who is genotype positive.`,
              source: { kind: 'genetic-test' as const, id: testId },
            })),
            {
              statement: `No genetic test for ${variantLabel(variant)} is recorded for ${fullName(person)}.`,
              source: { kind: 'person', id: person.id },
            },
          ],
        }),
      ]
    })
  })
}

/** DEMO-R-002 */
function pendingCascadeTest(snapshot: FamilySnapshot, today: IsoDate): FamilyAction[] {
  return snapshot.geneticTests.flatMap((test) => {
    if (test.kind !== 'cascade' || (test.status !== 'offered' && test.status !== 'sample-pending')) {
      return []
    }
    const person = snapshot.people.find((p) => p.id === test.personId)
    if (!person || !isLiving(person)) return []
    const statusText = test.status === 'offered' ? 'offered' : 'sample pending'
    const evidence: Evidence[] = [
      {
        statement: `Cascade test requested ${test.requestedDate}; status: ${statusText}.`,
        source: { kind: 'genetic-test', id: test.id },
      },
    ]
    if (test.expectedResultDate) {
      evidence.push({
        statement: `Expected result date recorded as ${test.expectedResultDate}.`,
        source: { kind: 'genetic-test', id: test.id },
      })
    }
    return [
      createAction({
        ruleId: 'DEMO-R-002',
        snapshot,
        person,
        subjectId: test.id,
        category: 'cascade-testing',
        what: 'Follow up pending cascade genetic test',
        when: test.expectedResultDate
          ? {
              kind: 'due',
              dueDate: test.expectedResultDate,
              dueState: dueStateOn(test.expectedResultDate, today),
            }
          : { kind: 'unscheduled' },
        raisedOn: test.requestedDate,
        summary: `Cascade test is awaiting completion (${statusText}).`,
        evidence,
      }),
    ]
  })
}

/** DEMO-R-003 */
function overdueSurveillance(snapshot: FamilySnapshot, today: IsoDate): FamilyAction[] {
  return snapshot.surveillancePlans.flatMap((plan) => {
    if (plan.status !== 'active' || dueStateOn(plan.nextDueDate, today) !== 'overdue') return []
    const person = snapshot.people.find((p) => p.id === plan.personId)
    if (!person || !isLiving(person)) return []
    return [
      createAction({
        ruleId: 'DEMO-R-003',
        snapshot,
        person,
        subjectId: plan.id,
        category: 'surveillance',
        what: 'Surveillance review overdue — consider recall',
        when: { kind: 'due', dueDate: plan.nextDueDate, dueState: 'overdue' },
        raisedOn: plan.nextDueDate,
        summary: `Seeded surveillance due date ${plan.nextDueDate} is before the demo date ${today}.`,
        evidence: [
          {
            statement: `${plan.description}: next due ${plan.nextDueDate}${plan.lastReviewDate ? `, last review ${plan.lastReviewDate}` : ''}.`,
            source: { kind: 'surveillance-plan', id: plan.id },
          },
        ],
      }),
    ]
  })
}

/** DEMO-R-004 */
function carrierWithoutSurveillance(snapshot: FamilySnapshot, today: IsoDate): FamilyAction[] {
  return variantContexts(snapshot, today).flatMap(({ variant, interpretation, carriers }) => {
    if (!isPathogenicOrLikelyPathogenic(interpretation.classification)) return []
    return carriers
      .filter(({ person }) => isLiving(person))
      .filter(({ person }) => !activeSurveillancePlan(snapshot.surveillancePlans, person.id))
      .map(({ person, resultDate, testId }) =>
        createAction({
          ruleId: 'DEMO-R-004',
          snapshot,
          person,
          subjectId: variant.id,
          category: 'surveillance',
          what: 'Consider clinician review of surveillance arrangements',
          when: { kind: 'unscheduled' },
          raisedOn: resultDate,
          summary: 'Genotype positive for a Pathogenic/Likely pathogenic variant with no active surveillance plan recorded.',
          evidence: [
            interpretationEvidence(variant, interpretation),
            {
              statement: `${fullName(person)} genotype positive (result ${resultDate}).`,
              source: { kind: 'genetic-test', id: testId },
            },
            {
              statement: 'No active surveillance plan recorded.',
              source: { kind: 'person', id: person.id },
            },
          ],
        }),
      )
  })
}

/** DEMO-R-005 */
function variantOfUncertainSignificance(snapshot: FamilySnapshot, today: IsoDate): FamilyAction[] {
  return variantContexts(snapshot, today).flatMap(({ variant, interpretation, carriers }) => {
    if (interpretation.classification !== 'vus') return []
    return carriers
      .filter(({ person }) => isLiving(person))
      .map(({ person, testId }) =>
        createAction({
          ruleId: 'DEMO-R-005',
          snapshot,
          person,
          subjectId: variant.id,
          category: 'genetic-interpretation',
          what: 'Consider periodic clinician review of variant interpretation status',
          when: { kind: 'unscheduled' },
          raisedOn: interpretation.effectiveDate,
          summary:
            'Familial variant is classified as a VUS; under demonstration rules, cascade testing is not prompted.',
          evidence: [
            interpretationEvidence(variant, interpretation),
            {
              statement: `${fullName(person)} carries ${variantLabel(variant)}.`,
              source: { kind: 'genetic-test', id: testId },
            },
          ],
        }),
      )
  })
}

/** Rules that derive testing/surveillance pathway actions from current state. */
export function runPathwayRules(snapshot: FamilySnapshot, today: IsoDate): FamilyAction[] {
  return [
    ...cascadeTestingConsideration(snapshot, today),
    ...pendingCascadeTest(snapshot, today),
    ...overdueSurveillance(snapshot, today),
    ...carrierWithoutSurveillance(snapshot, today),
    ...variantOfUncertainSignificance(snapshot, today),
  ]
}

