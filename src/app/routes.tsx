import type { RouteObject } from 'react-router'
import { ActionDetailPage } from '@/features/actions/ActionDetailPage'
import { ActionsPage } from '@/features/actions/ActionsPage'
import { CommandCentrePage } from '@/features/command-centre/CommandCentrePage'
import { FamiliesPage } from '@/features/families/FamiliesPage'
import { FamilyWorkspacePage } from '@/features/families/FamilyWorkspacePage'
import { ReclassificationImpactPage } from '@/features/reclassification/ReclassificationImpactPage'
import { ReclassificationsPage } from '@/features/reclassification/ReclassificationsPage'
import { RelativeProfilePage } from '@/features/relatives/RelativeProfilePage'
import { AppShell } from './AppShell'
import { NAV_ITEMS } from './navigation'
import { NotFoundPage } from './pages/NotFoundPage'
import { PlaceholderPage } from './pages/PlaceholderPage'

const BUILT = new Set(['/', '/families', '/actions', '/reclassifications'])

export const appRoutes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <CommandCentrePage /> },
      { path: '/families', element: <FamiliesPage /> },
      { path: '/families/:familyId', element: <FamilyWorkspacePage /> },
      { path: '/families/:familyId/people/:personId', element: <RelativeProfilePage /> },
      { path: '/actions', element: <ActionsPage /> },
      { path: '/actions/:actionId', element: <ActionDetailPage /> },
      { path: '/reclassifications', element: <ReclassificationsPage /> },
      { path: '/reclassifications/:eventId', element: <ReclassificationImpactPage /> },
      ...NAV_ITEMS.filter((item) => !BUILT.has(item.to)).map((item) => ({
        path: item.to,
        element: <PlaceholderPage item={item} />,
      })),
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
