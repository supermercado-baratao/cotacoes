import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import { fakerPT_BR } from '@faker-js/faker'
import retry from 'async-retry'
import { initializeApp } from 'firebase/app'
import {
  applyActionCode,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile
} from 'firebase/auth'

import { getData } from '@/components/blocks/catalog-import/utils'
import { auth as appAuth } from '@/infra/firebase-config'
import { importModel } from '@/models/import/model'

const PROJECT_ID = process.env.VITE_PROJECT_ID!
const MOCKS_DIR = path.join(import.meta.dirname, '_mocks')

const app = initializeApp(
  { apiKey: 'test-api-key', projectId: PROJECT_ID },
  'playwright-orchestrator'
)

const auth = getAuth(app)

connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })

type TUserData = { name: string; email: string; password: string }

export const createUserData = (): TUserData => ({
  name: fakerPT_BR.person.fullName(),
  email: `${randomUUID()}@example.com`,
  password: fakerPT_BR.internet.password()
})

export const verifyEmail = (email: string): Promise<void> =>
  retry(async () => {
    const response = await fetch(
      `http://localhost:9099/emulator/v1/projects/${PROJECT_ID}/oobCodes`
    )
    if (!response.ok)
      throw new Error(`Failed to fetch OOB codes: ${response.statusText}`)

    const data = (await response.json()) as {
      oobCodes: { email: string; oobCode: string; requestType: string }[]
    }

    const oobCode = data.oobCodes.findLast(
      (oobCode) =>
        oobCode.email === email.toLowerCase() &&
        oobCode.requestType === 'VERIFY_EMAIL'
    )?.oobCode

    if (!oobCode)
      throw new Error(`No email verification code found for ${email}`)

    await applyActionCode(auth, oobCode)
  })

export const createUser = async (): Promise<TUserData> => {
  const { name, email, password } = createUserData()

  const { user } = await createUserWithEmailAndPassword(
    appAuth,
    email,
    password
  )
  await updateProfile(user, { displayName: name })

  await fetch(
    'http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:update',
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer owner',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ localId: user.uid, emailVerified: true })
    }
  )
  // The token issued at signup still has email_verified: false, which firestore.rules rejects
  await user.getIdToken(true)

  return { name, email, password }
}

// Call after createUser(): the import writes under the signed-in uid.
export const populateDatabase = async (): Promise<void> => {
  const buffer = fs.readFileSync(path.join(MOCKS_DIR, 'import-data.xlsx'))
  const file = new File([new Uint8Array(buffer)], 'import-data.xlsx')
  const data = await getData(file)
  await importModel.import(data)
}
