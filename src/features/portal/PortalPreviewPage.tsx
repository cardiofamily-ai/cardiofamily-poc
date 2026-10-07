import { ArrowLeft, CalendarDays, Dna, HeartPulse, Info, MessageCircle, ShieldAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { SafetyBanner } from '@/components/SafetyBanner'
import { formatDisplayDate } from '@/lib/format'
import { useClock } from '@/state/clock-context'
import { primaryAction } from '@/state/display-priority'
import { useRelativeProfile } from '@/state/use-caseload'
import { profilePath } from '../shared/paths'
import { NEXT_STEP_TEXT, TESTING_TEXT } from './portal-text'

/** The synthetic relative shown in the preview. */
const PREVIEW = { familyId: 'fam-janssens', personId: 'p-janssens-pieter' } as const

function Card({ icon, title, children, emphasis = false }: { icon: ReactNode; title: string; children: ReactNode; emphasis?: boolean }) {
  return (
    <section
      aria-label={title}
      className={emphasis ? 'rounded-2xl bg-primary px-4 py-4 text-primary-foreground' : 'rounded-2xl border bg-card px-4 py-4'}
    >
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </h2>
      <div className={emphasis ? 'mt-2 text-sm' : 'mt-2 text-sm text-muted-foreground'}>{children}</div>
    </section>
  )
}

export function PortalPreviewPage() {
  const profile = useRelativeProfile(PREVIEW.familyId, PREVIEW.personId)!
  const today = useClock().today()
  const { person } = profile.summary
  const next = primaryAction(profile.actions)
  const plan = profile.summary.surveillance.plan
  const test = profile.genotype.test

  return (
    <div className="flex min-h-dvh flex-col bg-muted/40">
      <SafetyBanner />
      <header className="flex items-center justify-between border-b bg-background px-8 py-3">
        <div>
          <p className="text-sm font-semibold">Relative Portal preview</p>
          <p className="text-xs text-muted-foreground">UI simulation of what an invited relative could eventually see</p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Return to clinician demo
        </Link>
      </header>

      <main className="mx-auto grid w-full max-w-5xl flex-1 grid-cols-[minmax(0,1fr)_400px] items-start gap-12 px-8 py-10">
        <div className="space-y-4 pt-4 text-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Extending family care beyond the clinic</h1>
          <p className="text-muted-foreground">
            A future CardioFamily portal could let an invited relative see their own status and next step, written in
            plain language. This preview shows <span className="font-medium text-foreground">{person.givenName}</span>
            ’s view, derived from the same synthetic records the clinician sees.
          </p>
          <ul className="space-y-1.5 text-muted-foreground">
            <li>• Shows only this relative’s own testing, screening and next step.</li>
            <li>• Shows no other family member’s medical information.</li>
            <li>• Gives no medical advice; the care team decides what is appropriate.</li>
            <li>• Not built: sign-in, consent, messaging, booking or uploads.</li>
          </ul>
          <p>
            <Link to={profilePath(PREVIEW.familyId, PREVIEW.personId)} className="text-primary hover:underline">
              Compare with the clinician’s view of {person.givenName}
            </Link>
          </p>
        </div>

        <div
          role="region"
          aria-label={`Portal preview for ${person.givenName} ${person.familyName}`}
          className="overflow-hidden rounded-[2rem] border-8 border-foreground/85 bg-background shadow-xl"
        >
          <div className="flex items-center justify-between bg-background px-5 pt-4 pb-3">
            <span className="flex items-center gap-1.5 text-sm font-semibold">
              <HeartPulse aria-hidden className="size-4 text-primary" />
              CardioFamily
            </span>
            <span className="rounded-full bg-notice px-2 py-0.5 text-[10px] font-semibold text-notice-foreground uppercase">
              Preview
            </span>
          </div>
          <div className="space-y-3 px-4 pb-5">
            <p className="px-1 text-lg font-semibold">Hello, {person.givenName}</p>

            <Card icon={<MessageCircle aria-hidden className="size-4" />} title="Your next step" emphasis>
              {NEXT_STEP_TEXT[next?.category ?? 'none']}
            </Card>

            <Card icon={<Dna aria-hidden className="size-4" />} title="Your genetic test">
              <p>{TESTING_TEXT[profile.genotype.status]}</p>
              {test?.status === 'resulted' && <p className="mt-1 text-xs">Result date: {formatDisplayDate(test.resultDate)}</p>}
            </Card>

            <Card icon={<CalendarDays aria-hidden className="size-4" />} title="Your heart screening">
              {plan ? (
                <>
                  {plan.lastReviewDate && <p>Last screening on record: {formatDisplayDate(plan.lastReviewDate)}</p>}
                  <p>Next screening on record: {formatDisplayDate(plan.nextDueDate)}</p>
                </>
              ) : (
                <p>No heart screening plan is recorded for you.</p>
              )}
            </Card>

            <Card icon={<Info aria-hidden className="size-4" />} title="Why am I seeing this?">
              Hypertrophic cardiomyopathy (HCM) can run in families. When a genetic change is found in one family member,
              relatives may be offered testing and heart screening. Your care team will discuss what is right for you.
            </Card>

            <p className="flex gap-1.5 px-1 text-[11px] text-muted-foreground">
              <ShieldAlert aria-hidden className="mt-0.5 size-3 shrink-0" />
              Demonstration preview with synthetic data. Not a real patient portal and not medical advice. Shown as of{' '}
              {formatDisplayDate(today)}.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
