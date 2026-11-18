import { spawn } from 'node:child_process'
import {
  mkdirSync,
  openSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs'
import { setTimeout } from 'node:timers/promises'

const PID_FILE = 'node_modules/.cache/firebase-emulators.pid'
const LOG_FILE = 'firebase-emulators.log'
const PORTS = [9099, 8080]
const TIMEOUT_MS = 60_000
const INTERVAL_MS = 500

if (!process.env.VITE_PROJECT_ID) process.loadEnvFile('.env.development')

const isPortUp = async (port: number): Promise<boolean> => {
  try {
    await fetch(`http://127.0.0.1:${port}`)
    return true
  } catch {
    return false
  }
}

const areEmulatorsUp = async (): Promise<boolean> => {
  const ports = await Promise.all(PORTS.map((port) => isPortUp(port)))
  return ports.every(Boolean)
}

const readPid = (): number | null => {
  try {
    return Number(readFileSync(PID_FILE, 'utf8'))
  } catch {
    return null
  }
}

const up = async (): Promise<void> => {
  if (await areEmulatorsUp()) return

  const log = openSync(LOG_FILE, 'w')
  const child = spawn(
    'pnpm',
    [
      'exec',
      'firebase',
      'emulators:start',
      '--only',
      'auth,firestore',
      '--project',
      process.env.VITE_PROJECT_ID!
    ],
    { detached: true, stdio: ['ignore', log, log] }
  )
  let hasExited = false
  child.on('exit', () => {
    hasExited = true
  })
  child.unref()
  mkdirSync('node_modules/.cache', { recursive: true })
  writeFileSync(PID_FILE, String(child.pid))

  const deadline = Date.now() + TIMEOUT_MS
  process.stdout.write('Waiting for the Firebase emulators')
  while (!(await areEmulatorsUp())) {
    if (hasExited || Date.now() > deadline) {
      process.stdout.write('\n')
      throw new Error(`Firebase emulators did not start, see ${LOG_FILE}`)
    }
    process.stdout.write('.')
    await setTimeout(INTERVAL_MS)
  }
  process.stdout.write(' ready\n')
}

const down = async (): Promise<void> => {
  const pid = readPid()
  rmSync(PID_FILE, { force: true })
  if (!pid) return
  try {
    // A negative pid targets the detached process group, which includes the Java emulators
    process.kill(-pid, 'SIGTERM')
  } catch {
    // Already stopped
  }

  const deadline = Date.now() + TIMEOUT_MS
  while (await areEmulatorsUp()) {
    if (Date.now() > deadline)
      throw new Error('Firebase emulators did not stop in time')
    await setTimeout(INTERVAL_MS)
  }
}

const commands: Record<string, () => Promise<void>> = { up, down }
const run = commands[process.argv[2]]

if (!run) throw new Error('Usage: emulators.ts <up|down>')

await run()
