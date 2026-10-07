import { ChevronRight, CircleCheck } from 'lucide-react'
import { DueLabel } from '@/components/clinical/DueLabel'
import { RuleTag } from '@/components/clinical/RuleTag'
import { SafetyNote } from '@/components/clinical/SafetyNote'
import type { IsoDate } from '@/domain/time'
import type { FamilyOverview } from '@/state/caseload'
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
            : `${groups.length} ${groups.length === 1 ? 'person' : 'people'} · ${family.actions.length} open actions · select a person for details`}
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
            <li key={summary.person.id}>
              <button
                type="button"
                onClick={() => onSelect(summary.person.id)}
                className="group w-full px-4 py-3 text-left transition-colors hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:outline-none"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">
                    {fullName(summary.person)}
                    <span className="font-normal text-muted-foreground"> · {relationshipText(summary)}</span>
                  </span>
                  <ChevronRight aria-hidden className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
                <ul className="mt-1.5 space-y-2">
                  {actions.map((action) => (
                    <li key={action.id} className="text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-foreground">{action.what}</span>
                        <RuleTag ruleId={action.ruleId} className="shrink-0" />
                      </div>
                      <DueLabel when={action.when} today={today} className="mt-0.5 text-xs" />
                    </li>
                  ))}
                </ul>
              </button>
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
