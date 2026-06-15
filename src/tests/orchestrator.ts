import retry from 'async-retry'
import { applyActionCode, connectAuthEmulator } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'

import { app, auth } from '@/infra'

const PROJECT_ID = import.meta.env.VITE_PROJECT_ID as string

let connected = false

const connectToEmulators = (): void => {
  if (connected) return
  connected = true
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
  connectFirestoreEmulator(getFirestore(app), 'localhost', 8080)
}

const clearAuthUsers = async (): Promise<void> => {
  const res = await fetch(
    `http://localhost:9099/emulator/v1/projects/${PROJECT_ID}/accounts`,
    { method: 'DELETE' }
  )
  if (!res.ok) throw new Error(`Failed to clear auth users: ${res.statusText}`)
}

const clearFirestoreData = async (): Promise<void> => {
  const res = await fetch(
    `http://localhost:8080/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
    { method: 'DELETE' }
  )
  if (!res.ok) throw new Error(`Failed to clear Firestore: ${res.statusText}`)
}

const clearEmulatorData = async (): Promise<void> => {
  await Promise.all([clearAuthUsers(), clearFirestoreData()])
}

const verifyEmail = (email: string): Promise<void> =>
  retry(async () => {
    const res = await fetch(
      `http://localhost:9099/emulator/v1/projects/${PROJECT_ID}/oobCodes`
    )
    if (!res.ok) throw new Error(`Failed to fetch OOB codes: ${res.statusText}`)

    const data: {
      oobCodes: { email: string; oobCode: string; requestType: string }[]
    } = await res.json()

    const oobCode = data.oobCodes
      .filter(
        (oobCode) =>
          oobCode.email === email.toLowerCase() &&
          oobCode.requestType === 'VERIFY_EMAIL'
      )
      .at(-1)?.oobCode

    if (!oobCode)
      throw new Error(`No email verification code found for ${email}`)

    await applyActionCode(auth, oobCode)
  })

const orchestrator = {
  connectToEmulators,
  clearAuthUsers,
  clearFirestoreData,
  clearEmulatorData,
  verifyEmail
}

export default orchestrator
