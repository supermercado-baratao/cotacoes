import fs from 'node:fs'
import path from 'node:path'

import { faker } from '@faker-js/faker'
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
import { auth as appAuth } from '@/infra'
import { importModel } from '@/models'

const PROJECT_ID = process.env.VITE_PROJECT_ID!
const MOCKS_DIR = path.join(import.meta.dirname, '../_mocks')

// getData() (reaproveitado abaixo pra seed rápido) espera FileReader, que só
// existe no browser — Node tem File/Blob nativos, então implementamos só o
// suficiente (readAsArrayBuffer) sobre o Blob.arrayBuffer() nativo.
if (typeof globalThis.FileReader === 'undefined') {
  class NodeFileReader {
    result: ArrayBuffer | null = null
    onload: (() => void) | null = null
    onerror: ((error: unknown) => void) | null = null

    async readAsArrayBuffer(file: File) {
      try {
        this.result = await file.arrayBuffer()
        this.onload?.()
      } catch (error) {
        this.onerror?.(error)
      }
    }
  }

  // @ts-expect-error polyfill mínimo, não implementa a interface completa
  globalThis.FileReader = NodeFileReader
}

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

// Cria e autentica um usuário direto contra o Auth emulator, pulando o
// fluxo de signup + verify-email pela UI. O e-mail já sai verificado via
// chamada admin ao emulator (`Authorization: Bearer owner`), então o único
// passo de UI necessário depois é o login.
export const createUser = async (): Promise<{
  name: string
  email: string
  password: string
}> => {
  const name = faker.person.fullName()
  const email = faker.internet.email()
  const password = faker.internet.password()

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

// Popula produtos/famílias/departamentos/fornecedores direto no Firestore
// emulator reaproveitando o pipeline real de import (mesmo fixture usado
// pelo full-flow.spec.ts), sem passar pela UI de importação — precisa ser
// chamado depois de createUser(), já que o import grava sob o uid logado.
export const populateDatabase = async (): Promise<void> => {
  const buffer = fs.readFileSync(path.join(MOCKS_DIR, 'import-data.xlsx'))
  const file = new File([new Uint8Array(buffer)], 'import-data.xlsx')
  const data = await getData(file)
  await importModel.import(data)
}
