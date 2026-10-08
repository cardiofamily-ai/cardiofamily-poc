import { createBrowserRouter, createMemoryRouter, RouterProvider } from 'react-router'
import { AppProviders } from './AppProviders'
import { entryPath } from './entry'
import { appRoutes } from './routes'

// The Streamlit build runs as a single HTML document inside an iframe whose URL
// is not the app's own, so routing is kept in memory there. Every other build
// uses normal browser URLs. Either way a fresh load of the root starts on the
// Welcome page.
function createRouter() {
  if (import.meta.env.MODE === 'streamlit') return createMemoryRouter(appRoutes, { initialEntries: [entryPath('/')] })
  const { pathname, search, hash } = window.location
  const start = entryPath(pathname)
  if (start !== pathname) window.history.replaceState(window.history.state, '', start + search + hash)
  return createBrowserRouter(appRoutes)
}

const router = createRouter()

export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  )
}
