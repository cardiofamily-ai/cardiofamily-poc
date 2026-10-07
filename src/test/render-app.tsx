import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AppProviders } from '@/app/AppProviders'
import { appRoutes } from '@/app/routes'

/** Render the full application at a given route. */
export function renderApp(path = '/') {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] })
  const result = render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  )
  return { ...result, router }
}
