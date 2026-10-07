import { defineConfig, devices } from '@playwright/test'

process.loadEnvFile()

export default defineConfig({
  testDir: './src/tests/playwright',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Todos os specs compartilham o mesmo projeto do emulador (um único Auth +
  // Firestore) e cada arquivo limpa esses dados no seu beforeAll — rodar
  // arquivos em paralelo faz um deles apagar/sobrescrever dados que outro
  // ainda está usando. Sempre 1 worker, não só em CI.
  workers: 1,
  timeout: 60_000,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI
  }
})
