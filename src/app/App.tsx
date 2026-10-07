import { createBrowserRouter, createMemoryRouter, RouterProvider } from 'react-router'
import { AppProviders } from './AppProviders'
import { appRoutes } from './routes'

// The Streamlit build runs as a single HTML document inside an iframe whose URL
// is not the app's own, so routing is kept in memory there. Every other build
// uses normal browser URLs.
const router =
  import.meta.env.MODE === 'streamlit' ? createMemoryRouter(appRoutes) : createBrowserRouter(appRoutes)

export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  )
}
