import type { RouteObject } from 'react-router'
import { AppShell } from './AppShell'
import { NAV_ITEMS } from './navigation'
import { NotFoundPage } from './pages/NotFoundPage'
import { PlaceholderPage } from './pages/PlaceholderPage'

export const appRoutes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      ...NAV_ITEMS.map((item) => ({
        path: item.to,
        element: <PlaceholderPage item={item} />,
      })),
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
