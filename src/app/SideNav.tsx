import { HeartPulse } from 'lucide-react'
import { NavLink } from 'react-router'
import { formatDisplayDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useClock } from '@/state/clock-context'
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
                    'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
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
