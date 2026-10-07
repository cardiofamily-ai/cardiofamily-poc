import type { NavItem } from '../navigation'

interface PlaceholderPageProps {
  item: NavItem
}

/** Stand-in for screens delivered in later phases. */
export function PlaceholderPage({ item }: PlaceholderPageProps) {
  const Icon = item.icon
  return (
    <div className="mx-auto max-w-5xl px-10 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">{item.label}</h1>
      <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{item.summary}</p>

      <div className="mt-8 flex flex-col items-center rounded-lg border border-dashed px-6 py-16 text-center">
        <Icon aria-hidden className="size-6 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">Not yet built</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Planned for implementation phase {item.plannedPhase}.
        </p>
      </div>
    </div>
  )
}
