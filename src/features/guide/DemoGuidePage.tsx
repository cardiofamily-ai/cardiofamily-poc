import { Info } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { WELCOME_PATH } from '@/app/entry'
import { DEMO_ACTION_DISCLAIMER, DEMO_RULE_NOTICE, ENVIRONMENT_NOTICE, PROTOTYPE_NAME_NOTICE } from '@/domain/safety'
import { formatDisplayDate } from '@/lib/format'
import { useClock } from '@/state/clock-context'
import { profilePath } from '../shared/paths'

const JANSSENS = '/families/fam-janssens'
const PEETERS = '/families/fam-peeters'
const PEETERS_IMPACT = '/reclassifications/rc-peeters-1'

const SECTIONS = [
  { id: 'guide-story-a', label: 'A', title: 'Family Action' },
  { id: 'guide-story-b', label: 'B', title: 'Reclassification Impact' },
  { id: 'guide-portal', label: 'C', title: 'Relative Portal preview' },
  { id: 'guide-reset', label: 'D', title: 'Resetting the demo' },
  { id: 'guide-synthetic', label: 'E', title: 'Synthetic, demonstration-only status' },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

const LINK = 'font-medium text-primary underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'

function To({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className={LINK}>
      {children}
    </Link>
  )
}

function Section({ id, lead, children }: { id: SectionId; lead?: string; children: ReactNode }) {
  const { label, title } = SECTIONS.find((s) => s.id === id)!
  return (
    <section aria-labelledby={id} className="scroll-mt-6 border-t pt-6">
      <h2 id={id} tabIndex={-1} className="flex items-baseline gap-2.5 text-base font-semibold focus:outline-none">
        <span aria-hidden className="text-xs font-semibold text-primary tabular-nums">
          {label}
        </span>
        {title}
      </h2>
      {lead && <p className="mt-1 text-sm text-muted-foreground">{lead}</p>}
      <div className="mt-3 text-sm">{children}</div>
    </section>
  )
}

function Steps({ children }: { children: ReactNode }) {
  return <ol className="list-decimal space-y-2 pl-5 marker:text-muted-foreground">{children}</ol>
}

function Message({ children }: { children: ReactNode }) {
  return <p className="mt-3 border-l-2 border-primary/40 pl-3 text-muted-foreground">{children}</p>
}

/** Concise presenter guide for the two canonical stories, inside the clinician shell. */
export function DemoGuidePage() {
  const today = useClock().today()

  const jumpTo = (id: SectionId) => {
    const heading = document.getElementById(id)
    heading?.scrollIntoView?.({ block: 'start' })
    heading?.focus({ preventScroll: true })
  }

  return (
    <div className="mx-auto max-w-[880px] px-10 pt-8 pb-16">
      <header className="flex items-start justify-between gap-6">
        <div>
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">Demo guide</p>
          <h1 className="mt-1 text-[28px] leading-tight font-semibold tracking-tight">Presenting the CardioFamily POC</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Two short stories, about 8–10 minutes in total. Start from the <To to="/">Command Centre</To> with no decisions
            recorded.
          </p>
        </div>
        <Link
          to={WELCOME_PATH}
          className="mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Info aria-hidden className="size-4" />
          About this POC
        </Link>
      </header>

      <nav aria-label="Guide sections" className="mt-6">
        <ul className="flex flex-wrap gap-2 text-sm">
          {SECTIONS.map(({ id, label, title }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => jumpTo(id)}
                className="rounded-md border px-2.5 py-1 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span aria-hidden className="mr-1.5 text-xs font-semibold text-primary">
                  {label}
                </span>
                {title}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 space-y-8">
        <Section id="guide-story-a" lead="“Did the action actually happen?” — about 4 minutes.">
          <Steps>
            <li>
              Open <To to={JANSSENS}>Families → Janssens family</To>. The pedigree shows the family as one unit of care.
            </li>
            <li>
              Select <strong className="font-medium">Pieter</strong> in the pedigree, then{' '}
              <strong className="font-medium">Open relative profile</strong>
              {' '}(<To to={profilePath('fam-janssens', 'p-janssens-pieter')}>direct link</To>): RISK, NEXT ACTION and
              GENETIC INTERPRETATION side by side.
            </li>
            <li>
              Open his overdue action, <em>Surveillance review overdue — consider recall</em>. Walk through WHO / WHAT /
              WHEN / WHY; <strong className="font-medium">View record</strong> jumps to the evidence and RULE names the
              demonstration rule.
            </li>
            <li>
              In <strong className="font-medium">Workflow</strong>, record <em>Completed</em> with a short note. The outcome
              confirms that clinical care is unchanged.
            </li>
            <li>
              Back on Pieter’s profile, <em>Action and review history</em> shows the entry; the{' '}
              <To to="/">Command Centre</To> no longer lists him as overdue.
            </li>
          </Steps>
          <Message>CardioFamily identifies care gaps and tracks whether the resulting action actually happened.</Message>
        </Section>

        <Section id="guide-story-b" lead="“Whose care may need review?” — about 4 minutes.">
          <Steps>
            <li>
              From the Command Centre, open the Peeters <To to={PEETERS_IMPACT}>reclassification awaiting impact review</To>.
            </li>
            <li>
              <strong className="font-medium">What changed:</strong> last acknowledged classification <em>VUS</em> → latest
              laboratory classification <em>Likely pathogenic</em>. CardioFamily does not classify variants.
            </li>
            <li>
              <strong className="font-medium">Who may need attention:</strong> five relatives are highlighted, each with the
              reason. Nothing has changed yet.
            </li>
            <li>
              In <strong className="font-medium">Clinician review</strong>, choose <em>Reviewed</em> and{' '}
              <em>Record decision</em>. New items are raised for clinician review; no test, plan or treatment is changed.
            </li>
            <li>
              Return to the <To to={PEETERS}>Peeters family</To> and open <strong className="font-medium">Koen</strong>:
              RISK and history now reflect the reviewed classification.
            </li>
          </Steps>
          <Message>When genetic knowledge changes, CardioFamily shows whose care may need review — and the clinician stays in control.</Message>
        </Section>

        <Section id="guide-portal" lead="Optional — about 1 minute.">
          <Steps>
            <li>
              Open the <To to="/portal">Relative Portal preview</To> from the sidebar: Pieter’s own next step, test result
              and screening dates in plain language.
            </li>
            <li>It shows no other relative’s information and gives no medical advice.</li>
            <li>
              <strong className="font-medium">Return to clinician demo</strong> goes back to the Command Centre.
            </li>
          </Steps>
        </Section>

        <Section id="guide-reset">
          <p>
            Recorded decisions are held in memory only. Once a decision is recorded,{' '}
            <strong className="font-medium">Reset demo</strong> appears in the sidebar: confirm it to restore the seeded
            demonstration for the next audience. You stay on the current page. Reloading the page also restores the
            seeded state and opens the Welcome page.
          </p>
        </Section>

        <Section id="guide-synthetic">
          <ul className="list-disc space-y-1.5 pl-5 marker:text-muted-foreground">
            <li>{ENVIRONMENT_NOTICE}.</li>
            <li>{PROTOTYPE_NAME_NOTICE}</li>
            <li>
              Every generated action names its demonstration rule: {DEMO_RULE_NOTICE} {DEMO_ACTION_DISCLAIMER}
            </li>
            <li>CardioFamily never diagnoses, recommends treatment or changes clinical records; review decisions record workflow state only.</li>
            <li>The demo date is fixed at {formatDisplayDate(today)}.</li>
          </ul>
        </Section>
      </div>
    </div>
  )
}
