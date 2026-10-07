import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router'
import { SafetyBanner } from './SafetyBanner'
import { SideNav } from './SideNav'

export function AppShell() {
  const { pathname, hash } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  // The main panel is the scroll container: start each page at the top, or
  // at the linked record when the URL has a hash (e.g. evidence links).
  useEffect(() => {
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null
    if (target) target.scrollIntoView?.({ block: 'center' })
    else mainRef.current?.scrollTo?.({ top: 0 })
  }, [pathname, hash])

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
