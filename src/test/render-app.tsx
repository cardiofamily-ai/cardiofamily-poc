import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AppProviders } from '@/app/AppProviders'
import { appRoutes } from '@/app/routes'
import type { ActionWorkflowEntry } from '@/domain/action-workflow'
import type { ReviewEntry } from '@/domain/review'

/** Render the full application at a given route. */
export function renderApp(
  path = '/',
  options: { initialReviews?: readonly ReviewEntry[]; initialActionLog?: readonly ActionWorkflowEntry[] } = {},
) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] })
  const result = render(
    <AppProviders {...options}>
      <RouterProvider router={router} />
    </AppProviders>,
  )
  return { ...result, router }
}
