import { HeartPulse, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router'
import { formatDisplayDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useClock } from '@/state/clock-context'
import { useDemoSession } from '@/state/session-context'
import { NAV_ITEMS } from './navigation'

export function SideNav() {
  const clock = useClock()

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
          <HeartPulse aria-hidden className="size-4" />
        </span>
        <div className="leading-tight">
          <div className="text-sm font-semibold">CardioFamily</div>
          <div className="text-xs text-muted-foreground">HCM · Family care</div>
        </div>
      </div>

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
