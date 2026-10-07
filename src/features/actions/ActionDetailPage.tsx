import { ArrowRight, ChevronRight, Info, RefreshCcw, ShieldAlert } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { DueLabel } from '@/components/clinical/DueLabel'
import { RELATIVE_STATUS_TEXT, WORKFLOW_STATE_TEXT } from '@/components/clinical/labels'
import { ReviewStatusBadge } from '@/components/clinical/ReviewStatusBadge'
import { RuleTag } from '@/components/clinical/RuleTag'
import { WorkflowStateBadge } from '@/components/clinical/WorkflowStateBadge'
import { isOutstanding, type ActionWorkflowState } from '@/domain/action-workflow'
import { DEMO_RULES } from '@/domain/actions/rules'
import type { Evidence } from '@/domain/actions/types'
import { DEMO_ACTION_DISCLAIMER, DEMO_CATEGORISATION_NOTICE } from '@/domain/safety'
import { formatDatesInText, formatDisplayDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useClock } from '@/state/clock-context'
import { useDemoSession } from '@/state/session-context'
import { useAction } from '@/state/use-caseload'
import { recordAnchor } from '../relatives/record-anchor'
import { profilePath } from '../shared/paths'
import { fullName, relationshipText } from '../shared/person-text'
import { ActionWorkflowPanel, WORKFLOW_NOTICE } from './ActionWorkflowPanel'

const LINKABLE: ReadonlySet<Evidence['source']['kind']> = new Set([
  'genetic-test',
  'phenotype-assessment',
  'surveillance-plan',
])

function Section({ label, children }: { label: string; children: ReactNode }) {
  const id = `section-${label.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <section aria-labelledby={id} className="grid grid-cols-[120px_minmax(0,1fr)] gap-6 border-b px-5 py-4 last:border-b-0">
      <h2 id={id} className="pt-0.5 text-[11px] font-semibold tracking-wider text-primary uppercase">
        {label}
      </h2>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

export function ActionDetailPage() {
  const { actionId } = useParams()
  const found = useAction(actionId)
  const today = useClock().today()
  const { recordActionState } = useDemoSession()
  const outcomeRef = useRef<HTMLDivElement>(null)
  const [lastRecorded, setLastRecorded] = useState<ActionWorkflowState | null>(null)

  useEffect(() => {
    if (lastRecorded) outcomeRef.current?.focus()
  }, [lastRecorded])

  if (!found) {
    return (
      <div className="mx-auto max-w-5xl px-10 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Action not found</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          This action is not currently raised by the demonstration rules.
        </p>
        <Link to="/actions" className="mt-4 inline-block text-sm text-primary hover:underline">Back to actions</Link>
      </div>
    )
  }

  const { family, action, person } = found
  const rule = DEMO_RULES[action.ruleId]
  const familyId = family.snapshot.family.id
  const workflow = family.actionWorkflow[action.id]
  const reviewStatus = family.actionReviewStatus[action.id]!
  const isImpactReview = action.ruleId === 'DEMO-R-006'

  const record = (state: ActionWorkflowState, note: string) => {
    recordActionState({ actionId: action.id, state, note })
    setLastRecorded(state)
  }

  return (
    <div className="mx-auto max-w-[1400px] px-8 pt-6 pb-16">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/actions" className="hover:text-foreground">Actions</Link>
        <ChevronRight aria-hidden className="size-3" />
        <Link to={`/families/${familyId}`} className="hover:text-foreground">{family.snapshot.family.name}</Link>
        <ChevronRight aria-hidden className="size-3" />
        <span aria-current="page" className="text-foreground">{fullName(person.person)}</span>
      </nav>

      <header className="mt-2">
        <p className="text-xs font-semibold tracking-wider text-primary uppercase">Family action</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-[26px] leading-tight font-semibold tracking-tight">{action.what}</h1>
          {workflow ? <WorkflowStateBadge state={workflow.state} /> : <ReviewStatusBadge status={reviewStatus} />}
        </div>
      </header>

      {lastRecorded && workflow && (
        <div
          ref={outcomeRef}
          tabIndex={-1}
          role="status"
          aria-label="Workflow outcome"
          className={cn(
            'mt-4 rounded-lg border px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring',
            isOutstanding(workflow.state) ? 'bg-muted/60' : 'border-settled/30 bg-settled-soft',
          )}
        >
          <span className="font-semibold">Workflow state recorded: {WORKFLOW_STATE_TEXT[workflow.state]}.</span>{' '}
          {isOutstanding(workflow.state)
            ? 'The item remains outstanding in the Command Centre and family workspace.'
            : 'The item is no longer outstanding. No new action has been created.'}{' '}
          Clinical care is unchanged.
        </div>
      )}

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_360px] items-start gap-8">
        <article aria-label="Action detail" className="rounded-lg border bg-card">
          <Section label="Who">
            <p className="text-base font-semibold">
              <Link to={profilePath(familyId, person.person.id)} className="hover:text-primary hover:underline">
                {fullName(person.person)}
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">
              {relationshipText(person)} ·{' '}
              <Link to={`/families/${familyId}`} className="hover:text-foreground hover:underline">
                {family.snapshot.family.name}
              </Link>{' '}
              · proband {fullName(family.proband)}
            </p>
            <p className="mt-2 text-sm">
              <span className="text-muted-foreground">Risk: </span>
              {RELATIVE_STATUS_TEXT[family.relativeStatuses[person.person.id]!.category]}
            </p>
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Info aria-hidden className="size-3" />
              {DEMO_CATEGORISATION_NOTICE}
            </p>
          </Section>

          <Section label="What">
            <p className="text-sm font-medium">{action.what}</p>
          </Section>

          {workflow && !isOutstanding(workflow.state) && (
            <div className="flex gap-2 border-b bg-muted/40 px-5 py-3 text-xs text-muted-foreground" aria-label="Workflow and source record">
              <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
              <p>
                <span className="font-medium text-foreground">Workflow item: {WORKFLOW_STATE_TEXT[workflow.state]}.</span>{' '}
                The source record cited below still reflects the seeded clinical record; completing a demonstration
                workflow item does not alter clinical data.
              </p>
            </div>
          )}

          <Section label="When">
            <DueLabel when={action.when} today={today} className="text-sm" />
            <p className="mt-1 text-xs text-muted-foreground">
              Raised from a record dated {formatDisplayDate(action.raisedOn)}.
              {action.when.kind === 'due' && ' Due date taken from synthetic seed data.'}
            </p>
          </Section>

          <Section label="Why">
            <p className="text-sm">{formatDatesInText(action.why.summary)}</p>
            <ul aria-label="Supporting evidence" className="mt-2 space-y-1.5">
              {action.why.evidence.map((e, i) => (
                <li key={i} className="flex gap-1.5 text-sm text-muted-foreground">
                  <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground/60" />
                  <span>
                    {formatDatesInText(e.statement)}
                    {LINKABLE.has(e.source.kind) && (
                      <Link
                        to={`${profilePath(familyId, person.person.id)}#${recordAnchor(e.source.id)}`}
                        className="ml-1.5 whitespace-nowrap text-primary underline underline-offset-2"
                      >
                        View record
                      </Link>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          <Section label="Rule">
            <p className="flex flex-wrap items-center gap-2 text-sm">
              <RuleTag ruleId={action.ruleId} />
              <span className="font-medium">{rule.title}</span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Rule version {action.ruleVersion} · {action.engineVersion}
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">{rule.trigger}</p>
            <p className="mt-1.5 text-xs text-muted-foreground">{rule.notice}</p>
          </Section>

          <div className="flex items-center gap-2 bg-muted/40 px-5 py-3 text-xs text-muted-foreground">
            <ShieldAlert aria-hidden className="size-3.5 shrink-0" />
            <span className="font-medium text-foreground">{DEMO_ACTION_DISCLAIMER}</span>
          </div>
        </article>

        <aside className="sticky top-6 space-y-3">
          {workflow && !isImpactReview ? (
            <ActionWorkflowPanel workflow={workflow} today={today} onRecord={record} />
          ) : (
            <section aria-labelledby="impact-review-heading" className="rounded-lg border bg-card px-4 py-4 text-sm">
              <h2 id="impact-review-heading" className="flex items-center gap-2 font-semibold">
                <RefreshCcw aria-hidden className="size-4 text-genetics" />
                Follows the reclassification impact review
              </h2>
              <p className="mt-1.5 text-muted-foreground">
                This item is resolved by the clinician’s impact review for the reclassification, not individually.
              </p>
              <Link
                to={`/reclassifications/${action.subjectId}`}
                className="mt-3 inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                Open impact review <ArrowRight aria-hidden className="size-3.5" />
              </Link>
              <p className="mt-3 text-xs text-muted-foreground">{WORKFLOW_NOTICE}</p>
            </section>
          )}
          <Link
            to={profilePath(familyId, person.person.id)}
            className="flex items-center justify-center gap-1.5 rounded-md border bg-card px-3 py-2 text-sm hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Open {fullName(person.person)}’s profile
            <ArrowRight aria-hidden className="size-4" />
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-1.5 rounded-md border bg-card px-3 py-2 text-sm hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Return to Command Centre
          </Link>
        </aside>
      </div>
    </div>
  )
}
