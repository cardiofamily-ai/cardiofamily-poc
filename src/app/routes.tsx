import type { RouteObject } from 'react-router'
import { ActionDetailPage } from '@/features/actions/ActionDetailPage'
import { ActionsPage } from '@/features/actions/ActionsPage'
import { CommandCentrePage } from '@/features/command-centre/CommandCentrePage'
import { FamiliesPage } from '@/features/families/FamiliesPage'
import { FamilyWorkspacePage } from '@/features/families/FamilyWorkspacePage'
import { DemoGuidePage } from '@/features/guide/DemoGuidePage'
import { PortalPreviewPage } from '@/features/portal/PortalPreviewPage'
import { ReclassificationImpactPage } from '@/features/reclassification/ReclassificationImpactPage'
import { ReclassificationsPage } from '@/features/reclassification/ReclassificationsPage'
import { RelativeProfilePage } from '@/features/relatives/RelativeProfilePage'
import { WelcomePage } from '@/features/welcome/WelcomePage'
import { AppShell } from './AppShell'
import { GUIDE_PATH, WELCOME_PATH } from './entry'
import { NotFoundPage } from './pages/NotFoundPage'

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
      { path: GUIDE_PATH, element: <DemoGuidePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  // The relative-facing preview and the first-entry Welcome page deliberately sit outside the clinician shell.
  { path: '/portal', element: <PortalPreviewPage /> },
  { path: WELCOME_PATH, element: <WelcomePage /> },
]
