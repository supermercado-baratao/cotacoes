import retry from 'async-retry'
import { initializeApp } from 'firebase/app'
import { applyActionCode, connectAuthEmulator, getAuth } from 'firebase/auth'

const PROJECT_ID = process.env.VITE_PROJECT_ID!

const app = initializeApp(
  { apiKey: 'test-api-key', projectId: PROJECT_ID },
  'playwright-orchestrator'
)

const auth = getAuth(app)

connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })

export const clearData = async (): Promise<void> => {
  await Promise.all([
    fetch(`http://localhost:9099/emulator/v1/projects/${PROJECT_ID}/accounts`, {
      method: 'DELETE'
    }),
    fetch(
      `http://localhost:8080/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
      { method: 'DELETE' }
    )
  ])
}

export const verifyEmail = (email: string): Promise<void> =>
  retry(async () => {
    const res = await fetch(
      `http://localhost:9099/emulator/v1/projects/${PROJECT_ID}/oobCodes`
    )
    if (!res.ok) throw new Error(`Failed to fetch OOB codes: ${res.statusText}`)

    const data = (await res.json()) as {
      oobCodes: { email: string; oobCode: string; requestType: string }[]
    }

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
