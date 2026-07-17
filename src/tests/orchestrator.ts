import { faker } from '@faker-js/faker'
import retry from 'async-retry'
import {
  applyActionCode,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth'

import { auth } from '@/infra'
import { importModel } from '@/models'
import { getData } from '@/pages/import/utils'

import { readMockFile } from './_utils/read-mock-file'

const PROJECT_ID = import.meta.env.VITE_PROJECT_ID as string

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

const createUser = async (
  user?: Partial<{
    name: string
    email: string
    password: string
  }>
) => {
  const name = user?.name || faker.person.fullName()
  const email = user?.email || faker.internet.email()
  const password = user?.password || faker.internet.password()

  const { user: createdUser } = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  )
  await Promise.all([
    sendEmailVerification(createdUser),
    updateProfile(createdUser, { displayName: name })
  ])
  await verifyEmail(email)
  await createdUser.reload()
  return createdUser
}

const populateDatabase = async (): Promise<void> => {
  const buffer = await readMockFile('import-data.xlsx')
  const file = new File([new Uint8Array(buffer)], 'import-data.xlsx')
  const data = await getData(file)
  await importModel.import(data)
}

const orchestrator = {
  clearAuthUsers,
  clearFirestoreData,
  clearEmulatorData,
  verifyEmail,
  createUser,
  populateDatabase
}

export default orchestrator
