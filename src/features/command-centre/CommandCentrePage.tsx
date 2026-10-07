import { AlertTriangle, CalendarClock, ChevronRight, ClipboardList, Dna, RefreshCcw, Users, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ClassificationBadge } from '@/components/clinical/ClassificationBadge'
import { DueLabel } from '@/components/clinical/DueLabel'
import { ReviewStatusBadge } from '@/components/clinical/ReviewStatusBadge'
import { RuleTag } from '@/components/clinical/RuleTag'
import { SafetyNote } from '@/components/clinical/SafetyNote'
import { variantLabel } from '@/domain/actions/rules'
import type { DemoRuleId, FamilyAction } from '@/domain/actions/types'
import type { IsoDate } from '@/domain/time'
import { formatDatesInText, formatDisplayDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { AttentionItem, Caseload, FamilyOverview, ReclassificationItem } from '@/state/caseload'
import { upcomingSurveillance } from '@/state/caseload'
import { useClock } from '@/state/clock-context'
import { useCaseload } from '@/state/use-caseload'
import { fullName, relationshipText } from '../shared/person-text'

const isOverdue = (a: FamilyAction) => a.when.kind === 'due' && a.when.dueState === 'overdue'
const isUpcoming = (a: FamilyAction) => a.when.kind === 'due' && a.when.dueState === 'upcoming'

export function CommandCentrePage() {
  const caseload = useCaseload()
  const today = useClock().today()
  const { attention, totals } = caseload

  const overdue = attention.filter((i) => isOverdue(i.action))
  const upcoming = attention.filter((i) => isUpcoming(i.action))
  const forReview = attention.filter(
    (i) => i.action.when.kind === 'unscheduled' && i.action.category !== 'reclassification-review',
  )
  const reclassifications = caseload.families.flatMap((family) =>
    family.pendingReclassifications.map((pending) => ({ family, pending })),
  )

  return (
    <div className="mx-auto max-w-[1280px] px-10 pt-8 pb-16">
      <header>
        <p className="text-xs font-semibold tracking-wider text-primary uppercase">Command Centre</p>
        <h1 className="mt-1 text-[28px] leading-tight font-semibold tracking-tight">Who needs attention now?</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {totals.openActions} open actions for {totals.familiesNeedingAttention} of {totals.families} synthetic
          families, ordered by urgency. Every item is a demonstration output awaiting clinician review.
        </p>
      </header>

      <SignalStrip caseload={caseload} />

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)_296px] gap-10">
        <section aria-labelledby="queue-heading" className="space-y-7">
          <div className="flex items-baseline justify-between border-b pb-2">
            <h2 id="queue-heading" className="text-base font-semibold">Attention queue</h2>
            <SafetyNote />
          </div>

          <QueueSection title="Overdue" icon={AlertTriangle} tone="overdue" count={overdue.length}>
            {overdue.map((item) => <AttentionRow key={item.action.id} item={item} today={today} />)}
          </QueueSection>

          <QueueSection
            title="Variant reclassification — awaiting impact review"
            icon={RefreshCcw}
            tone="genetics"
            count={reclassifications.length}
          >
            {reclassifications.map(({ family, pending }) => (
              <ReclassificationRow key={pending.event.id} family={family} pending={pending} />
            ))}
          </QueueSection>

          <QueueSection title="Due date approaching" icon={CalendarClock} tone="due" count={upcoming.length}>
            {upcoming.map((item) => <AttentionRow key={item.action.id} item={item} today={today} />)}
          </QueueSection>

          <QueueSection title="For clinician review · no due date" icon={ClipboardList} tone="neutral" count={forReview.length}>
            {forReview.map((item) => <AttentionRow key={item.action.id} item={item} today={today} />)}
          </QueueSection>
        </section>

        <aside className="space-y-8">
          <ReclassificationStatus families={caseload.families} />
          <UpcomingSurveillance caseload={caseload} />
          <FamiliesAtAGlance families={caseload.families} />
        </aside>
      </div>
    </div>
  )
}

function SignalStrip({ caseload }: { caseload: Caseload }) {
  const { totals } = caseload
  const events = caseload.families.reduce((n, f) => n + f.pendingReclassifications.length, 0)
  const signals: { label: string; value: ReactNode; note: string; icon: LucideIcon; tone: string }[] = [
    { label: 'Overdue', value: totals.overdueActions, note: 'surveillance or test follow-up', icon: AlertTriangle, tone: 'text-overdue' },
    { label: 'Cascade testing', value: totals.cascadeTestingActions, note: 'relatives to consider or follow up', icon: Dna, tone: 'text-foreground' },
    { label: 'Reclassification reviews', value: totals.reclassificationReviews, note: `${events} variant ${events === 1 ? 'event' : 'events'} awaiting impact review`, icon: RefreshCcw, tone: 'text-genetics' },
    { label: 'Families needing attention', value: <>{totals.familiesNeedingAttention}<span className="text-base font-normal text-muted-foreground"> / {totals.families}</span></>, note: 'with at least one open action', icon: Users, tone: 'text-foreground' },
  ]
  return (
    <dl className="mt-6 grid grid-cols-4 divide-x rounded-lg border bg-card">
      {signals.map(({ label, value, note, icon: Icon, tone }) => (
        <div key={label} className="px-5 py-3.5">
          <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Icon aria-hidden className={cn('size-3.5', tone)} />
            {label}
          </dt>
          <dd className={cn('mt-1 text-2xl font-semibold tabular-nums', tone)}>{value}</dd>
          <dd className="text-xs text-muted-foreground">{note}</dd>
        </div>
      ))}
    </dl>
  )
}

const TONES = {
  overdue: { text: 'text-overdue', rail: 'before:bg-overdue' },
  genetics: { text: 'text-genetics', rail: 'before:bg-genetics' },
  due: { text: 'text-due', rail: 'before:bg-due' },
  neutral: { text: 'text-muted-foreground', rail: 'before:bg-border' },
} as const

function QueueSection({
  title,
  icon: Icon,
  tone,
  count,
  children,
}: {
  title: string
  icon: LucideIcon
  tone: keyof typeof TONES
  count: number
  children: ReactNode
}) {
  if (count === 0) return null
  return (
    <section aria-label={title}>
      <h3 className={cn('mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide uppercase', TONES[tone].text)}>
        <Icon aria-hidden className="size-3.5" />
        {title}
        <span className="rounded-full bg-muted px-1.5 text-[11px] font-medium text-muted-foreground tabular-nums">
          {count}
        </span>
      </h3>
      <ul
        className={cn(
          'relative divide-y overflow-hidden rounded-lg border bg-card',
          'before:absolute before:inset-y-0 before:left-0 before:w-[3px]',
          TONES[tone].rail,
        )}
      >
        {children}
      </ul>
    </section>
  )
}

const ROW = 'group grid grid-cols-[156px_200px_minmax(0,1fr)_16px] items-start gap-5 py-3 pr-4 pl-5 transition-colors hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:outline-none'

function RowMeta({ ruleId }: { ruleId: DemoRuleId }) {
  return (
    <div className="mt-1.5 flex items-center gap-2">
      <RuleTag ruleId={ruleId} />
      <SafetyNote compact />
    </div>
  )
}

function RowChevron() {
  return (
    <ChevronRight
      aria-hidden
      className="mt-0.5 size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
    />
  )
}

function AttentionRow({ item, today }: { item: AttentionItem; today: IsoDate }) {
  const { action, person, family } = item
  return (
    <li>
      <Link to={`/families/${family.snapshot.family.id}/people/${person.person.id}`} className={ROW}>
        <DueLabel when={action.when} today={today} className="text-sm" />
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{fullName(person.person)}</div>
          <div className="truncate text-xs text-muted-foreground">
            {relationshipText(person)} · {family.snapshot.family.name}
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-sm">{action.what}</div>
          <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {formatDatesInText(action.why.summary)}
          </div>
          <RowMeta ruleId={action.ruleId} />
        </div>
        <RowChevron />
      </Link>
    </li>
  )
}

function ReclassificationRow({ family, pending }: { family: FamilyOverview; pending: ReclassificationItem }) {
  const { event, variant, impact, review } = pending
  const names = impact.affectedPeople.map(
    (p) => family.people.find((s) => s.person.id === p.personId)!.person.givenName,
  )
  return (
    <li>
      <Link to={`/reclassifications/${event.id}`} className={ROW}>
        <span className="inline-flex flex-col text-sm">
          <span className="inline-flex items-center gap-1.5 font-medium text-genetics">
            <RefreshCcw aria-hidden className="size-3.5" />
            Received
          </span>
          <span className="pl-5 text-xs text-muted-foreground">{formatDisplayDate(event.receivedDate)}</span>
          {review.status === 'deferred' && <ReviewStatusBadge status="deferred" className="mt-1.5 ml-5 self-start" />}
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{family.snapshot.family.name}</div>
          <div className="truncate text-xs text-muted-foreground">Proband {fullName(family.proband)}</div>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            <span className="font-medium">{variantLabel(variant)}</span>
            <ClassificationBadge classification={impact.from} />
            <span aria-label="reclassified to" className="text-muted-foreground">→</span>
            <ClassificationBadge classification={impact.to} />
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {names.length} people may need clinician review: {names.join(', ')}. Workflow unchanged until a
            clinician records the impact review.
          </div>
          <RowMeta ruleId="DEMO-R-006" />
        </div>
        <RowChevron />
      </Link>
    </li>
  )
}

function UpcomingSurveillance({ caseload }: { caseload: Caseload }) {
  const items = upcomingSurveillance(caseload).slice(0, 6)
  return (
    <section aria-labelledby="upcoming-heading">
      <h2 id="upcoming-heading" className="border-b pb-2 text-sm font-semibold">Upcoming surveillance</h2>
      <ul className="mt-1 divide-y">
        {items.map(({ family, person, dueDate }) => (
          <li key={person.person.id}>
            <Link
              to={`/families/${family.snapshot.family.id}/people/${person.person.id}`}
              className="flex items-baseline justify-between gap-3 py-2 text-sm hover:text-primary"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">{fullName(person.person)}</span>
                <span className="block truncate text-xs text-muted-foreground">{family.snapshot.family.name}</span>
              </span>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{formatDisplayDate(dueDate)}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-muted-foreground">Dates from synthetic seed data.</p>
    </section>
  )
}

function FamiliesAtAGlance({ families }: { families: readonly FamilyOverview[] }) {
  return (
    <section aria-labelledby="families-heading">
      <div className="flex items-baseline justify-between border-b pb-2">
        <h2 id="families-heading" className="text-sm font-semibold">Families</h2>
        <Link to="/families" className="text-xs text-primary hover:underline">View all</Link>
      </div>
      <ul className="mt-1 divide-y">
        {families.map((f) => (
          <li key={f.snapshot.family.id}>
            <Link to={`/families/${f.snapshot.family.id}`} className="block py-2 text-sm hover:text-primary">
              <span className="flex items-baseline justify-between gap-3">
                <span className="font-medium">{f.snapshot.family.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {f.actions.length === 0 ? 'Up to date' : `${f.actions.length} open`}
                </span>
              </span>
              {(f.overdueActions > 0 || f.pendingReclassifications.length > 0) && (
                <span className="mt-0.5 flex gap-3 text-xs">
                  {f.overdueActions > 0 && (
                    <span className="inline-flex items-center gap-1 font-medium text-overdue">
                      <AlertTriangle aria-hidden className="size-3" />
                      {f.overdueActions} overdue
                    </span>
                  )}
                  {f.pendingReclassifications.length > 0 && (
                    <span className="inline-flex items-center gap-1 font-medium text-genetics">
                      <RefreshCcw aria-hidden className="size-3" />
                      Reclassification received
                    </span>
                  )}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ReclassificationStatus({ families }: { families: readonly FamilyOverview[] }) {
  const items = families.flatMap((family) => family.reclassifications.map((item) => ({ family, item })))
  if (items.length === 0) return null
  return (
    <section aria-labelledby="reclassification-status-heading">
      <div className="flex items-baseline justify-between border-b pb-2">
        <h2 id="reclassification-status-heading" className="text-sm font-semibold">Reclassifications</h2>
        <Link to="/reclassifications" className="text-xs text-primary hover:underline">View all</Link>
      </div>
      <ul className="mt-1 divide-y">
        {items.map(({ family, item }) => (
          <li key={item.event.id}>
            <Link to={`/reclassifications/${item.event.id}`} className="block py-2 text-sm hover:text-primary">
              <span className="flex items-baseline justify-between gap-2">
                <span className="font-medium">{family.snapshot.family.name}</span>
                <span className="text-xs text-muted-foreground">{formatDisplayDate(item.event.receivedDate)}</span>
              </span>
              <span className="mt-1 flex items-center gap-1.5 text-xs">
                <ClassificationBadge classification={item.impact.from} />
                <span aria-label="to">→</span>
                <ClassificationBadge classification={item.impact.to} />
                <ReviewStatusBadge status={item.review.status} className="ml-auto" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
