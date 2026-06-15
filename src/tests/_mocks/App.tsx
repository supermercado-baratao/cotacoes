import { QueryClient } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router'

import App from '@/App'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
})

export const createApp = (initialPath: string) => {
  const router = createMemoryRouter(
    [
      {
        path: '*',
        element: <App queryClient={queryClient} />
      }
    ],
    { initialEntries: [initialPath] }
  )

  return { router, App: () => <RouterProvider router={router} /> }
}
