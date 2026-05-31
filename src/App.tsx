import { CssBaseline, ThemeProvider } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AppProvider, AuthProvider } from './providers'
import { Router } from './Router'
import { dark } from './themes'

const queryClient = new QueryClient()

const App = () => (
  <ThemeProvider theme={dark}>
    <CssBaseline />
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <Router />
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
)

export default App
