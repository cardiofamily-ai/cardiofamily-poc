import { BookOpen, Info, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router'
import { BrandMark } from '@/components/brand/BrandMark'
import { PROTOTYPE_NAME_NOTICE } from '@/domain/safety'
import { formatDisplayDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useClock } from '@/state/clock-context'
import { useDemoSession } from '@/state/session-context'
import { GUIDE_PATH, WELCOME_PATH } from './entry'
import { NAV_ITEMS } from './navigation'

const HELP_LINK =
  'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none'

export function SideNav() {
  const clock = useClock()

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <BrandMark className="px-5 py-5" />

      <nav aria-label="Primary" className="flex-1 px-3">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm',
                    'focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none',
                    isActive
                      ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                      : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                  )
                }
              >
                <Icon aria-hidden className="size-4" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <nav aria-label="About the demo" className="px-3 pb-3">
        <ul className="space-y-0.5">
          <li>
            <NavLink to={GUIDE_PATH} className={({ isActive }) => cn(HELP_LINK, isActive && 'font-medium text-sidebar-foreground')}>
              <BookOpen aria-hidden className="size-3.5" />
              Demo guide
            </NavLink>
          </li>
          <li>
            <NavLink to={WELCOME_PATH} className={HELP_LINK}>
              <Info aria-hidden className="size-3.5" />
              About this POC
            </NavLink>
          </li>
        </ul>
      </nav>

      <ResetDemo />

      <dl className="space-y-2 border-t border-sidebar-border px-5 py-4 text-xs">
        <div>
          <dt className="text-muted-foreground">Demo date</dt>
          <dd className="font-medium tabular-nums">{formatDisplayDate(clock.today())}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Dataset</dt>
          <dd className="font-medium">Synthetic · fictional families</dd>
        </div>
      </dl>
      <p className="px-5 pb-4 text-[10px] leading-snug text-muted-foreground">{PROTOTYPE_NAME_NOTICE}</p>
    </aside>
  )
}

/** Clears in-memory review and workflow decisions, restoring the seeded demonstration. */
function ResetDemo() {
  const { reviews, actionLog, resetDemo } = useDemoSession()
  const [confirming, setConfirming] = useState(false)
  const recorded = reviews.length + actionLog.length

  return (
    <div className="border-t border-sidebar-border px-5 py-3 text-xs" aria-label="Demo session" role="group">
      <p className="font-medium">Demo session</p>
      <p className="text-muted-foreground">
        {recorded === 0
          ? 'No decisions recorded. In memory only; reload or reset restores the seeded demo.'
          : `${recorded} ${recorded === 1 ? 'decision' : 'decisions'} recorded (in memory only)`}
      </p>
      {recorded === 0 ? null : confirming ? (
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => {
              resetDemo()
              setConfirming(false)
            }}
            className="rounded-md bg-primary px-2.5 py-1 font-medium text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Confirm reset
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-md border px-2.5 py-1 hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-2 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-medium hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <RotateCcw aria-hidden className="size-3" />
          Reset demo
        </button>
      )}
    </div>
  )
}
