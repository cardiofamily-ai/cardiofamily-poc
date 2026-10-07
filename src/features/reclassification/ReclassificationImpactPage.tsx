import { ArrowRight, ChevronRight, RefreshCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ClassificationBadge } from '@/components/clinical/ClassificationBadge'
import { CLASSIFICATION_SHORT, RELATIVE_STATUS_TEXT } from '@/components/clinical/labels'
import { ReviewStatusBadge } from '@/components/clinical/ReviewStatusBadge'
import { RuleTag } from '@/components/clinical/RuleTag'
import { Pedigree } from '@/components/pedigree/Pedigree'
import { variantLabel } from '@/domain/actions/rules'
import type { VariantInterpretation } from '@/domain/genetics/types'
import type { ReviewDecision } from '@/domain/review'
import type { IsoDate } from '@/domain/time'
import { formatDisplayDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { FamilyOverview, ReclassificationItem } from '@/state/caseload'
import { useClock } from '@/state/clock-context'
import { useDemoSession } from '@/state/session-context'
import { useReclassification } from '@/state/use-caseload'
import { pedigreeNodeData } from '../families/pedigree-data'
import { fullName, relationshipText } from '../shared/person-text'
import { describeImpact, exclusionReason } from './impact-text'
import { ImpactReviewPanel } from './ImpactReviewPanel'

export function ReclassificationImpactPage() {
  const { eventId } = useParams()
  const found = useReclassification(eventId)
  const today = useClock().today()
  const { recordReview } = useDemoSession()
  const outcomeRef = useRef<HTMLDivElement>(null)
  const [justRecorded, setJustRecorded] = useState(false)

  useEffect(() => {
    if (justRecorded) outcomeRef.current?.focus()
  }, [justRecorded, found?.item.review.status])

  if (!found) {
    return (
      <div className="mx-auto max-w-5xl px-10 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Reclassification not found</h1>
        <Link to="/reclassifications" className="mt-4 inline-block text-sm text-primary hover:underline">
          Back to reclassifications
        </Link>
      </div>
    )
  }

  const { family, item } = found
  const { event, variant, review } = item
  const previous = family.snapshot.interpretations.find((i) => i.id === event.previousInterpretationId)!
  const familyPath = `/families/${family.snapshot.family.id}`

  const record = (decision: ReviewDecision, note: string) => {
    recordReview({ subjectId: event.id, status: decision, note })
    setJustRecorded(true)
  }
  const reopen = () => {
    recordReview({ subjectId: event.id, status: 'pending-clinician-review' })
    setJustRecorded(true)
  }

  return (
    <div className="mx-auto max-w-[1400px] px-8 pt-6 pb-16">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/reclassifications" className="hover:text-foreground">Reclassifications</Link>
        <ChevronRight aria-hidden className="size-3" />
        <span aria-current="page" className="text-foreground">{family.snapshot.family.name}</span>
      </nav>

      <header className="mt-2">
        <div className="flex items-center gap-3">
          <h1 className="text-[26px] leading-tight font-semibold tracking-tight">Reclassification impact</h1>
          <ReviewStatusBadge status={review.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          <Link to={familyPath} className="font-medium text-foreground hover:underline">{family.snapshot.family.name}</Link>
          {' · '}proband {fullName(family.proband)} · {variantLabel(variant)}
        </p>
      </header>

      <Outcome ref={outcomeRef} item={item} family={family} />

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_360px] items-start gap-8">
        <div className="space-y-8">
          <WhatChanged item={item} previous={previous} family={family} />
          <WhoMayNeedAttention item={item} family={family} today={today} />
        </div>
        <aside className="sticky top-6">
          <ImpactReviewPanel item={item} today={today} onRecord={record} onReturnToPending={reopen} />
          <Link
            to={familyPath}
            className="mt-3 flex items-center justify-center gap-1.5 rounded-md border bg-card px-3 py-2 text-sm hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Return to {family.snapshot.family.name}
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </aside>
      </div>
    </div>
  )
}

function Outcome({ ref, item, family }: { ref: React.Ref<HTMLDivElement>; item: ReclassificationItem; family: FamilyOverview }) {
  const raised = item.impact.affectedPeople.flatMap((p) => p.reasons).filter((r) => r.kind === 'action-raised').length
  const messages = {
    'pending-clinician-review': null,
    reviewed: (
      <>
        <span className="font-semibold">Impact reviewed.</span> The demonstration workflow for the{' '}
        {family.snapshot.family.name} now uses the {CLASSIFICATION_SHORT[item.impact.to]} classification: {raised} new{' '}
        {raised === 1 ? 'item has' : 'items have'} been raised, each awaiting clinician review. No test, surveillance plan
        or treatment has been changed. This demonstrates workflow propagation, not an automated medical decision.
      </>
    ),
    deferred: (
      <>
        <span className="font-semibold">Impact review deferred.</span> The workflow is unchanged and the review remains
        open in the Command Centre.
      </>
    ),
    'not-applicable': (
      <>
        <span className="font-semibold">Marked not applicable.</span> The workflow is unchanged; the impact review items
        are closed. The laboratory classification is still shown as received.
      </>
    ),
  } as const
  const message = messages[item.review.status]
  if (!message) return null
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="status"
      aria-label="Review outcome"
      className={cn(
        'mt-4 rounded-lg border px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring',
        item.review.status === 'reviewed' ? 'border-settled/30 bg-settled-soft' : 'bg-muted/60',
      )}
    >
      {message}
    </div>
  )
}

function InterpretationCard({ title, interpretation, extra }: { title: string; interpretation: VariantInterpretation; extra?: string }) {
  return (
    <div className="min-w-0 flex-1 rounded-lg border bg-card px-4 py-3">
      <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{title}</p>
      <p className="mt-1.5">
        <ClassificationBadge classification={interpretation.classification} className="px-2 py-0.5 text-sm" />
      </p>
      <dl className="mt-2 space-y-0.5 text-xs text-muted-foreground">
        <div><dt className="inline">Laboratory: </dt><dd className="inline">{interpretation.laboratory}</dd></div>
        <div><dt className="inline">Report: </dt><dd className="inline font-mono">{interpretation.reportReference}</dd></div>
        <div><dt className="inline">Effective: </dt><dd className="inline">{formatDisplayDate(interpretation.effectiveDate)}</dd></div>
        {extra && <div>{extra}</div>}
      </dl>
    </div>
  )
}

function WhatChanged({ item, previous, family }: { item: ReclassificationItem; previous: VariantInterpretation; family: FamilyOverview }) {
  const carriers = item.impact.affectedPeople.filter((p) => p.reasons.some((r) => r.kind === 'test-result'))
  return (
    <section aria-labelledby="what-changed-heading">
      <h2 id="what-changed-heading" className="mb-3 text-base font-semibold">What changed</h2>
      <div className="flex items-stretch gap-3">
        <InterpretationCard
          title={item.review.status === 'reviewed' ? 'Previously acknowledged classification' : 'Last acknowledged classification'}
          interpretation={previous}
        />
        <div className="flex items-center text-genetics" aria-hidden>
          <ArrowRight className="size-5" />
        </div>
        <InterpretationCard
          title={
            item.review.status === 'reviewed'
              ? 'Latest laboratory classification · acknowledged'
              : item.review.status === 'not-applicable'
                ? 'Latest laboratory classification · marked not applicable'
                : 'Latest laboratory classification · awaiting clinician review'
          }
          interpretation={item.event.newInterpretation}
          extra={`Received: ${formatDisplayDate(item.event.receivedDate)}`}
        />
      </div>
      <div className="mt-3 rounded-lg bg-muted/50 px-4 py-3 text-sm">
        <p className="font-medium">Why this family is affected</p>
        <p className="mt-0.5 text-muted-foreground">
          {carriers.map((c) => fullName(family.people.find((p) => p.person.id === c.personId)!.person)).join(', ')}{' '}
          {carriers.length === 1 ? 'has' : 'have'} a recorded result for {variantLabel(item.variant)}. Relatives’ testing
          and surveillance pathways in this family were arranged while the variant was classified{' '}
          {CLASSIFICATION_SHORT[item.impact.from]}.
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Classifications are reported by the (fictional) laboratory. CardioFamily does not classify variants.
        </p>
      </div>
    </section>
  )
}

function WhoMayNeedAttention({ item, family, today }: { item: ReclassificationItem; family: FamilyOverview; today: IsoDate }) {
  const affected = item.impact.affectedPeople
  const affectedIds = new Set(affected.map((p) => p.personId))
  const reasons = affected.flatMap((p) => p.reasons)
  const count = (kind: string, ruleId?: string) =>
    reasons.filter((r) => r.kind === kind && (!ruleId || ('action' in r && r.action.ruleId === ruleId))).length
  const notIncluded = family.people.filter((p) => !affectedIds.has(p.person.id))
  const nodeData = Object.fromEntries(
    Object.entries(pedigreeNodeData(family, today)).map(([id, d]) => [
      id,
      { ...d, attention: { count: 0, overdue: 0 }, description: `${d.description}${affectedIds.has(id) ? ', potentially affected by this reclassification' : ''}` },
    ]),
  )
  const applied = item.review.status === 'reviewed'

  return (
    <section aria-labelledby="who-heading">
      <h2 id="who-heading" className="text-base font-semibold">When genetic knowledge changes, who in this family may need attention?</h2>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground" aria-label="Impact summary">
        <li><span className="font-semibold text-foreground">{affected.length}</span> people potentially affected</li>
        <li><span className="font-semibold text-foreground">{count('action-raised', 'DEMO-R-001')}</span> cascade-testing considerations {applied ? 'raised' : 'would be raised'}</li>
        <li><span className="font-semibold text-foreground">{count('surveillance-plan')}</span> surveillance plans to review</li>
        <li><span className="font-semibold text-foreground">{count('action-resolved')}</span> VUS-dependent item {applied ? 'closed' : 'would close'}</li>
      </ul>

      <div className="mt-4 rounded-lg border bg-card px-4 py-4">
        <Pedigree
          people={family.snapshot.people}
          data={nodeData}
          label={`Pedigree of the ${family.snapshot.family.name}, potentially affected relatives highlighted`}
          highlightIds={affectedIds}
        />
        <p className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span aria-hidden className="inline-block size-3.5 rounded-full border border-dashed border-genetics/60 bg-genetics-soft" />
          Highlighted: potentially affected by this reclassification
        </p>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border bg-card">
        <div className="grid grid-cols-[200px_minmax(0,1fr)_minmax(0,1fr)] gap-5 border-b bg-muted/40 px-5 py-2 text-xs font-medium text-muted-foreground">
          <span>Who</span>
          <span>Why they are included</span>
          <span>What may require review</span>
        </div>
        <ul className="divide-y" aria-label="Potentially affected relatives">
          {affected.map(({ personId, reasons: personReasons }) => {
            const summary = family.people.find((p) => p.person.id === personId)!
            const { why, review } = describeImpact(family, item, personReasons)
            return (
              <li key={personId} className="grid grid-cols-[200px_minmax(0,1fr)_minmax(0,1fr)] gap-5 px-5 py-3.5">
                <div>
                  <Link
                    to={`/families/${family.snapshot.family.id}/people/${personId}`}
                    className="text-sm font-medium hover:text-primary hover:underline"
                  >
                    {fullName(summary.person)}
                  </Link>
                  <p className="text-xs text-muted-foreground">{relationshipText(summary)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {RELATIVE_STATUS_TEXT[family.relativeStatuses[personId]!.category]}
                  </p>
                </div>
                <ul className="space-y-1 text-sm">
                  {why.map((w) => (
                    <li key={w} className="flex gap-1.5">
                      <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground/60" />
                      {w}
                    </li>
                  ))}
                </ul>
                <ul className="space-y-1.5 text-sm">
                  {review.map((r) => (
                    <li key={r.label + r.text}>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        {r.ruleId ? <RuleTag ruleId={r.ruleId} /> : <RefreshCcw aria-hidden className="size-3 text-genetics" />}
                        {r.label}
                      </span>
                      <span className="mt-0.5 block">{r.text}</span>
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ul>
      </div>

      {notIncluded.length > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Not included: </span>
          {notIncluded.map((p) => `${fullName(p.person)} (${exclusionReason(family, p.person.id).toLowerCase()})`).join('; ')}.
        </p>
      )}
    </section>
  )
}
