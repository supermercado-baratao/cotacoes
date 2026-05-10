import { CssBaseline, ThemeProvider } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AppProvider } from './providers/app-provider'
import { Router } from './Router'
import { dark } from './themes'

const queryClient = new QueryClient()

const App = () => (
  <ThemeProvider theme={dark}>
    <CssBaseline />
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Router />
      </AppProvider>
    </QueryClientProvider>
  </ThemeProvider>
)

export default App
