import { ShieldAlert } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { WORKFLOW_STATE_TEXT } from '@/components/clinical/labels'
import { WorkflowStateBadge } from '@/components/clinical/WorkflowStateBadge'
import { nextWorkflowStates, type ActionWorkflowState, type CurrentWorkflow } from '@/domain/action-workflow'
import { DEMO_REVIEWER } from '@/domain/review'
import { DEMO_ACTION_DISCLAIMER } from '@/domain/safety'
import type { IsoDate } from '@/domain/time'
import { formatDisplayDate } from '@/lib/format'
import { cn } from '@/lib/utils'

export const WORKFLOW_NOTICE = 'Records the CardioFamily workflow state. This does not change clinical care.'

const DESCRIPTIONS: Record<ActionWorkflowState, string> = {
  open: 'Not yet started. Returns the item to the untouched state.',
  'in-progress': 'Work on this item has started. It remains outstanding.',
  completed: 'The workflow item is done. CardioFamily closes it; no new action is created.',
  deferred: 'Postponed. It remains visible as unresolved.',
  'not-applicable': 'Does not apply to this person. CardioFamily closes it.',
}

interface ActionWorkflowPanelProps {
  workflow: CurrentWorkflow
  today: IsoDate
  onRecord: (state: ActionWorkflowState, note: string) => void
}

export function ActionWorkflowPanel({ workflow, today, onRecord }: ActionWorkflowPanelProps) {
  const [choice, setChoice] = useState<ActionWorkflowState | null>(null)
  const [note, setNote] = useState('')
  const noteId = useId()

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!choice) return
    onRecord(choice, note)
    setChoice(null)
    setNote('')
  }

  return (
    <section aria-labelledby="workflow-heading" className="rounded-lg border bg-card">
      <header className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <h2 id="workflow-heading" className="text-sm font-semibold">Workflow</h2>
        <WorkflowStateBadge state={workflow.state} />
      </header>

      <form onSubmit={submit} className="space-y-4 px-4 py-4">
        <fieldset>
          <legend className="text-sm font-medium">Record workflow state</legend>
          <div className="mt-2 space-y-2">
            {nextWorkflowStates(workflow.state).map((state) => (
              <label
                key={state}
                className={cn(
                  'flex cursor-pointer gap-3 rounded-md border px-3 py-2 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                  choice === state ? 'border-primary/50 bg-accent' : 'hover:bg-accent/40',
                )}
              >
                <input
                  type="radio"
                  name="workflow-state"
                  value={state}
                  checked={choice === state}
                  onChange={() => setChoice(state)}
                  className="mt-1 accent-primary"
                />
                <span>
                  <span className="block text-sm font-medium">{WORKFLOW_STATE_TEXT[state]}</span>
                  <span className="block text-xs text-muted-foreground">{DESCRIPTIONS[state]}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor={noteId} className="text-sm font-medium">
            Note <span className="font-normal text-muted-foreground">(optional, synthetic)</span>
          </label>
          <textarea
            id={noteId}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="e.g. Recall letter sent (synthetic)"
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Recorded by {DEMO_REVIEWER} · {formatDisplayDate(today)}
        </p>

        <button
          type="submit"
          disabled={!choice}
          className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          Record workflow state
        </button>
      </form>

      <div className="flex gap-2 border-t bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
        <ShieldAlert aria-hidden className="mt-0.5 size-3.5 shrink-0" />
        <p>
          {WORKFLOW_NOTICE} {DEMO_ACTION_DISCLAIMER}
        </p>
      </div>

      <div className="border-t px-4 py-3">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Action history</h3>
        <ol className="mt-2 space-y-2 text-xs">
          {workflow.history.toReversed().map((entry) => (
            <li key={entry.id}>
              <span className="font-medium">{WORKFLOW_STATE_TEXT[entry.state]}</span>
              <span className="text-muted-foreground"> · {entry.recordedBy} · {formatDisplayDate(entry.date)}</span>
              {entry.note && <p className="mt-0.5 text-muted-foreground">“{entry.note}”</p>}
            </li>
          ))}
          <li className="text-muted-foreground">Raised by the demonstration rules · Open</li>
        </ol>
      </div>
    </section>
  )
}
