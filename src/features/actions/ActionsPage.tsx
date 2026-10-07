import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { DueLabel } from '@/components/clinical/DueLabel'
import { ReviewStatusBadge } from '@/components/clinical/ReviewStatusBadge'
import { RuleTag } from '@/components/clinical/RuleTag'
import { SafetyNote } from '@/components/clinical/SafetyNote'
import { WorkflowStateBadge } from '@/components/clinical/WorkflowStateBadge'
import { cn } from '@/lib/utils'
import { useClock } from '@/state/clock-context'
import { worklist, type WorklistFilter } from '@/state/worklist'
import { useCaseload } from '@/state/use-caseload'
import { actionPath } from '../shared/paths'
import { fullName, relationshipText } from '../shared/person-text'

const FILTERS: { value: WorklistFilter; label: string }[] = [
  { value: 'outstanding', label: 'Outstanding' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'deferred', label: 'Deferred' },
  { value: 'closed', label: 'Closed' },
  { value: 'all', label: 'All' },
]

export function ActionsPage() {
  const caseload = useCaseload()
  const today = useClock().today()
  const [filter, setFilter] = useState<WorklistFilter>('outstanding')
  const { rows, counts } = worklist(caseload, filter)

  return (
    <div className="mx-auto max-w-[1280px] px-10 pt-8 pb-16">
      <header>
        <h1 className="text-[28px] leading-tight font-semibold tracking-tight">Actions</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Every action raised by the demonstration rules across synthetic families, with its workflow state.
        </p>
      </header>

      <div role="group" aria-label="Filter actions" className="mt-5 flex gap-1.5">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            className={cn(
              'rounded-full border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
              filter === value ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-accent',
            )}
          >
            {label} <span className="tabular-nums opacity-75">{counts[value]}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <caption className="sr-only">Actions — {FILTERS.find((f) => f.value === filter)!.label}</caption>
          <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th scope="col" className="py-2.5 pr-4 pl-5 font-medium">When</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Who</th>
              <th scope="col" className="px-4 py-2.5 font-medium">What</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Rule</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Status</th>
              <th scope="col" className="w-10"><span className="sr-only">Open</span></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-muted-foreground">No actions in this view.</td>
              </tr>
            )}
            {rows.map(({ action, person, family, workflow, reviewStatus }) => (
              <tr key={action.id} className="group relative align-top transition-colors hover:bg-accent/40 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring has-[a:focus-visible]:ring-inset">
                <td className="py-3 pr-4 pl-5"><DueLabel when={action.when} today={today} /></td>
                <td className="px-4 py-3">
                  <div className="font-medium">{fullName(person.person)}</div>
                  <div className="text-xs text-muted-foreground">
                    {relationshipText(person)} · {family.snapshot.family.name}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={actionPath(action.id)}
                    className="after:absolute after:inset-0 focus-visible:outline-none group-focus-within:underline"
                  >
                    {action.what}
                  </Link>
                </td>
                <td className="px-4 py-3"><RuleTag ruleId={action.ruleId} /></td>
                <td className="px-4 py-3">
                  {workflow ? <WorkflowStateBadge state={workflow.state} /> : <ReviewStatusBadge status={reviewStatus} />}
                </td>
                <td className="pr-4 py-3 text-muted-foreground">
                  <ChevronRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SafetyNote className="mt-3" />
    </div>
  )
}
