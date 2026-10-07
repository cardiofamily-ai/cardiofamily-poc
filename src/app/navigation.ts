import { Activity, ListChecks, RefreshCcw, Smartphone, Users, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    to: '/',
    label: 'Command Centre',
    icon: Activity,
  },
  {
    to: '/families',
    label: 'Families',
    icon: Users,
  },
  {
    to: '/actions',
    label: 'Actions',
    icon: ListChecks,
  },
  {
    to: '/reclassifications',
    label: 'Reclassifications',
    icon: RefreshCcw,
  },
  {
    to: '/portal',
    label: 'Relative Portal preview',
    icon: Smartphone,
  },
]
