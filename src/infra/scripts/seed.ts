import { writeFileSync } from 'node:fs'
import path from 'node:path'

import { runnerImport } from 'vite'

process.loadEnvFile('.env.development')

// Firebase never lets a `demo-` project reach real resources
if (!process.env.VITE_PROJECT_ID!.startsWith('demo-'))
  throw new Error('The seed only runs against the Firebase emulators')

const CREDENTIALS_FILE = 'seed-credentials.json'

const { module } = await runnerImport<typeof import('@/tests/seed')>(
  '/src/tests/seed.ts',
  {
    mode: 'development',
    logLevel: 'error',
    // runnerImport ignores vite.config.ts
    resolve: { alias: { '@': path.resolve('src') } }
  }
)

const credentials = await module.seed()
writeFileSync(CREDENTIALS_FILE, `${JSON.stringify(credentials, null, 2)}\n`)

console.log(`User created, credentials saved to ${CREDENTIALS_FILE}:`)
console.log(credentials)
