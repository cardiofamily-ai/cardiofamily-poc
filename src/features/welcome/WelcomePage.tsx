import { ArrowRight, BookOpen, Check, ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { GUIDE_PATH } from '@/app/entry'
import { BrandMark } from '@/components/brand/BrandMark'
import { SafetyBanner } from '@/components/SafetyBanner'
import { SmallScreenNotice } from '@/components/SmallScreenNotice'
import { DEMO_ACTION_DISCLAIMER, PROTOTYPE_NAME_NOTICE } from '@/domain/safety'
import { formatDisplayDate } from '@/lib/format'
import { useClock } from '@/state/clock-context'

const DEMONSTRATES = [
  'Family-level HCM workflow',
  'Cascade-testing and surveillance tracking',
  'Transparent Family Action workflow',
  'Variant reclassification family-impact review',
  'Clinician review and action history',
  'Relative Portal preview',
] as const

const JOURNEY = [
  {
    title: 'Story A — Family Action',
    steps: ['Janssens family', 'Pieter', 'Overdue action', 'WHO / WHAT / WHEN / WHY', 'Record workflow outcome'],
  },
  {
    title: 'Story B — Reclassification Impact',
    steps: ['Peeters family', 'VUS → Likely pathogenic', 'Affected relatives', 'Clinician review'],
  },
] as const

const FOCUS = 'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none'

/** First-entry page: what the POC is, what it shows, and the way in. Outside the clinician shell. */
export function WelcomePage() {
  const today = useClock().today()

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SafetyBanner />
      <SmallScreenNotice />
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <BrandMark size="md" />
          <Link
            to={GUIDE_PATH}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground ${FOCUS}`}
          >
            <BookOpen aria-hidden className="size-4" />
            Demo guide
          </Link>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-6 py-12 lg:px-10 lg:py-16">
        <section aria-labelledby="welcome-heading" className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">CardioFamily</p>
          <h1
            id="welcome-heading"
            className="mt-3 text-3xl leading-tight font-semibold tracking-tight text-balance lg:text-[40px]"
          >
            One cardiac genetic diagnosis should trigger appropriate care for the whole family.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            This interactive POC demonstrates how inherited cardiovascular teams could identify family members requiring
            attention, track cascade testing and surveillance, and understand the family-wide impact of new genetic
            evidence.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/"
              className={`inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 ${FOCUS}`}
            >
              Enter CardioFamily POC
              <ArrowRight aria-hidden className="size-4" />
            </Link>
            <Link
              to={GUIDE_PATH}
              className={`inline-flex h-11 items-center rounded-lg border bg-background px-4 text-sm font-medium hover:bg-muted ${FOCUS}`}
            >
              View demo guide
            </Link>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            No sign-in. Decisions you record are held in memory for this session only.
          </p>
        </section>

        <div className="mt-14 grid gap-12 border-t pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
          <section aria-labelledby="demonstrates-heading">
            <h2 id="demonstrates-heading" className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              What this POC demonstrates
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {DEMONSTRATES.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="journey-heading">
            <h2 id="journey-heading" className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Recommended demo journey
            </h2>
            <ul className="mt-4 divide-y rounded-lg border">
              {JOURNEY.map(({ title, steps }) => (
                <li key={title} className="px-5 py-4">
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <ol aria-label={`${title} steps`} className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground">
                    {steps.map((step, i) => (
                      <li key={step} className="flex items-center gap-1.5">
                        {i > 0 && <ChevronRight aria-hidden className="size-3.5 text-muted-foreground/70" />}
                        {step}
                      </li>
                    ))}
                  </ol>
                </li>
              ))}
              <li className="px-5 py-4">
                <h3 className="text-sm font-semibold">
                  Optional — Relative Portal preview
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  An invited relative’s own plain-language view of their next step.
                </p>
              </li>
            </ul>
          </section>
        </div>
      </main>

      <footer className="border-t bg-muted/40">
        <div className="mx-auto max-w-5xl space-y-1 px-6 py-5 text-xs text-muted-foreground lg:px-10">
          <p>
            All clinical-like outputs: {DEMO_ACTION_DISCLAIMER} Fixed demo date: {formatDisplayDate(today)}.
          </p>
          <p>{PROTOTYPE_NAME_NOTICE}</p>
        </div>
      </footer>
    </div>
  )
}
