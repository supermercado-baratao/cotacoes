// One-off migration: creates `departments` from the free text in
// `product.department` and fills `product.departmentId` across the catalog.
//
// Usage:
//   set -a && source .env.production.local && set +a
//   MIGRATION_EMAIL=you@example.com MIGRATION_PASSWORD=your-password \
//     node scripts/migrate-departments.mjs --dry-run
//
// Run with --dry-run first, then without the flag to write. The account must
// own the data, since collections live under users/{uid}/...

import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  writeBatch
} from 'firebase/firestore'

const isDryRun = process.argv.includes('--dry-run')

const requiredEnv = [
  'VITE_API_KEY',
  'VITE_AUTH_DOMAIN',
  'VITE_PROJECT_ID',
  'VITE_STORAGE_BUCKET',
  'VITE_MESSAGING_SENDER_ID',
  'VITE_APP_ID',
  'MIGRATION_EMAIL',
  'MIGRATION_PASSWORD'
]

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Variável de ambiente faltando: ${key}`)
    process.exit(1)
  }
}

const firebaseConfig = {
  apiKey: process.env.VITE_API_KEY,
  authDomain: process.env.VITE_AUTH_DOMAIN,
  projectId: process.env.VITE_PROJECT_ID,
  storageBucket: process.env.VITE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_APP_ID
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const firestore = getFirestore(app)

// Must match normalizeDepartmentKey/slugifyDepartmentId in
// src/components/blocks/catalog-import/utils.ts, or the next catalog import
// duplicates the departments created here.
const normalizeDepartmentKey = (description) =>
  description.trim().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const slugifyDepartmentId = (description) =>
  normalizeDepartmentKey(description)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'departamento'

const BATCH_CHUNK_SIZE = 500

const commitInChunks = async (items) => {
  if (isDryRun || !items.length) return
  for (let i = 0; i < items.length; i += BATCH_CHUNK_SIZE) {
    const batch = writeBatch(firestore)
    items
      .slice(i, i + BATCH_CHUNK_SIZE)
      .forEach(({ ref, data }) => batch.set(ref, data, { merge: true }))
    await batch.commit()
  }
}

const run = async () => {
  const credential = await signInWithEmailAndPassword(
    auth,
    process.env.MIGRATION_EMAIL,
    process.env.MIGRATION_PASSWORD
  )
  const uid = credential.user.uid
  const userPath = (collectionName) => `users/${uid}/${collectionName}`

  console.log(`Logado como ${credential.user.email} (${uid})`)
  if (isDryRun) console.log('--- MODO DRY-RUN: nenhuma escrita será feita ---')

  const productsSnapshot = await getDocs(
    collection(firestore, userPath('products'))
  )
  const products = productsSnapshot.docs.map((d) => ({
    id: d.id,
    ...d.data()
  }))
  console.log(`${products.length} produtos carregados`)

  const departmentsSnapshot = await getDocs(
    collection(firestore, userPath('departments'))
  )
  const departmentIdByKey = new Map(
    departmentsSnapshot.docs.map((d) => [
      normalizeDepartmentKey(d.data().description),
      d.id
    ])
  )
  console.log(`${departmentIdByKey.size} departamentos já cadastrados`)

  const now = new Date()
  const newDepartments = []

  for (const product of products) {
    const description = (product.department ?? '').trim()
    if (!description) continue
    const key = normalizeDepartmentKey(description)
    if (departmentIdByKey.has(key)) continue
    const id = slugifyDepartmentId(description)
    departmentIdByKey.set(key, id)
    newDepartments.push({ id, description })
  }

  console.log(`${newDepartments.length} departamentos novos a criar`)
  if (isDryRun) {
    newDepartments
      .slice(0, 10)
      .forEach((d) => console.log(`  - ${d.description}`))
    if (newDepartments.length > 10) console.log('  ...')
  }
  await commitInChunks(
    newDepartments.map(({ id, description }) => ({
      ref: doc(firestore, userPath('departments'), id),
      data: { id, description, createdAt: now, updatedAt: now }
    }))
  )

  const productUpdates = products
    .map((product) => {
      const description = (product.department ?? '').trim()
      const departmentId = description
        ? (departmentIdByKey.get(normalizeDepartmentKey(description)) ?? null)
        : null
      return { product, departmentId }
    })
    .filter(
      ({ product, departmentId }) => product.departmentId !== departmentId
    )
    .map(({ product, departmentId }) => ({
      ref: doc(firestore, userPath('products'), product.id),
      data: { departmentId, updatedAt: now }
    }))

  console.log(`${productUpdates.length} produtos a atualizar com departmentId`)
  await commitInChunks(productUpdates)

  console.log(isDryRun ? 'Dry-run concluído.' : 'Migração concluída.')
  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
