import type { RouteObject } from 'react-router'
import { CommandCentrePage } from '@/features/command-centre/CommandCentrePage'
import { FamiliesPage } from '@/features/families/FamiliesPage'
import { FamilyWorkspacePage } from '@/features/families/FamilyWorkspacePage'
import { RelativeProfilePage } from '@/features/relatives/RelativeProfilePage'
import { AppShell } from './AppShell'
import { NAV_ITEMS } from './navigation'
import { NotFoundPage } from './pages/NotFoundPage'
import { PlaceholderPage } from './pages/PlaceholderPage'

const BUILT = new Set(['/', '/families'])

export const appRoutes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <CommandCentrePage /> },
      { path: '/families', element: <FamiliesPage /> },
      { path: '/families/:familyId', element: <FamilyWorkspacePage /> },
      { path: '/families/:familyId/people/:personId', element: <RelativeProfilePage /> },
      ...NAV_ITEMS.filter((item) => !BUILT.has(item.to)).map((item) => ({
        path: item.to,
        element: <PlaceholderPage item={item} />,
      })),
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
