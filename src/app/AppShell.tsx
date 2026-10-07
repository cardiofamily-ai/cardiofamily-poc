import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router'
import { SafetyBanner } from './SafetyBanner'
import { SideNav } from './SideNav'

export function AppShell() {
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  // The main panel is the scroll container; start each page at the top.
  useEffect(() => {
    mainRef.current?.scrollTo?.({ top: 0 })
  }, [pathname])

  return (
    <div className="flex h-dvh min-w-[1024px] flex-col overflow-clip bg-background">
      <SafetyBanner />
      <div className="flex min-h-0 flex-1">
        <SideNav />
        <main ref={mainRef} id="main" className="relative min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
