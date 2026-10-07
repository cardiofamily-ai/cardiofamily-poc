import { Outlet } from 'react-router'
import { SafetyBanner } from './SafetyBanner'
import { SideNav } from './SideNav'

export function AppShell() {
  return (
    <div className="flex h-dvh min-w-[1024px] flex-col overflow-clip bg-background">
      <SafetyBanner />
      <div className="flex min-h-0 flex-1">
        <SideNav />
        <main id="main" className="relative min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
