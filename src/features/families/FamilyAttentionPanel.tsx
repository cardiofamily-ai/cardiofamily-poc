import { ChevronRight, CircleCheck } from 'lucide-react'
import { DueLabel } from '@/components/clinical/DueLabel'
import { RuleTag } from '@/components/clinical/RuleTag'
import { SafetyNote } from '@/components/clinical/SafetyNote'
import type { IsoDate } from '@/domain/time'
import type { FamilyOverview } from '@/state/caseload'
import { Link } from 'react-router'
import { ActionStatus } from '../shared/ActionStatus'
import { actionPath } from '../shared/paths'
import { fullName, relationshipText } from '../shared/person-text'

/** Default side panel: who in this family needs attention, grouped by person. */
export function FamilyAttentionPanel({
  family,
  today,
  onSelect,
}: {
  family: FamilyOverview
  today: IsoDate
  onSelect: (personId: string) => void
}) {
  const groups = family.people
    .map((summary) => ({ summary, actions: family.actions.filter((a) => a.personId === summary.person.id) }))
    .filter((g) => g.actions.length > 0)
    .toSorted(
      (a, b) => family.actions.indexOf(a.actions[0]!) - family.actions.indexOf(b.actions[0]!),
    )

  return (
    <section aria-labelledby="attention-heading">
      <header className="border-b px-4 py-3">
        <h2 id="attention-heading" className="text-sm font-semibold">Who needs attention</h2>
        <p className="text-xs text-muted-foreground">
          {groups.length === 0
            ? 'No open actions in this family.'
            : `${groups.length} ${groups.length === 1 ? 'person' : 'people'} · ${family.actions.length} outstanding actions`}
        </p>
      </header>
      {groups.length === 0 ? (
        <div className="flex items-center gap-2 px-4 py-6 text-sm text-settled">
          <CircleCheck aria-hidden className="size-4" />
          All recorded testing and surveillance is up to date.
        </div>
      ) : (
        <ul className="divide-y">
          {groups.map(({ summary, actions }) => (
            <li key={summary.person.id} className="px-4 py-3">
              <button
                type="button"
                onClick={() => onSelect(summary.person.id)}
                className="group flex w-full items-center justify-between gap-2 rounded text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="text-sm font-medium group-hover:text-primary">
                  {fullName(summary.person)}
                  <span className="font-normal text-muted-foreground"> · {relationshipText(summary)}</span>
                </span>
                <ChevronRight aria-hidden className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </button>
              <ul className="mt-1.5 space-y-1">
                {actions.map((action) => (
                  <li key={action.id}>
                    <Link
                      to={actionPath(action.id)}
                      className="-mx-2 block rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-foreground">{action.what}</span>
                        <RuleTag ruleId={action.ruleId} className="shrink-0" />
                      </span>
                      <span className="mt-0.5 flex items-center gap-2">
                        <DueLabel when={action.when} today={today} className="text-xs" />
                        <ActionStatus family={family} action={action} hideOpen className="ml-auto" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
      <footer className="border-t px-4 py-2.5">
        <SafetyNote />
      </footer>
    </section>
  )
}
