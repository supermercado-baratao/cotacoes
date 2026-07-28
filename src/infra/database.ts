import {
  collection,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  query,
  type QueryConstraint,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore'

import type { TCreateData, TUpdateData } from '@/types'

import { InternalServerError } from './errors'
import { firestore } from './firebase-config'

const findUniqueById = async <T>({
  id,
  path
}: {
  id: string
  path: string
}): Promise<T | null> => {
  const docRef = doc(firestore, path, id)
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? { ...(docSnap.data() as T), id } : null
}

const findMany = async <T>({
  path,
  queryConstraints
}: {
  path: string
  queryConstraints?: QueryConstraint[]
}): Promise<T[]> => {
  const q = query(collection(firestore, path), ...(queryConstraints ?? []))
  const { docs } = await getDocs(q)
  const data = docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }))
  return data as T[]
}

const writeTimestamps = () => ({
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
})

const create = async <T>({
  data,
  path
}: {
  data: TCreateData<T>
  path: string
}): Promise<T> => {
  const docRef = doc(collection(firestore, path))
  const now = Timestamp.now()
  await setDoc(docRef, { ...data, id: docRef.id, ...writeTimestamps() })
  return { ...data, id: docRef.id, createdAt: now, updatedAt: now } as T
}

const createWithId = async <T>({
  data,
  path
}: {
  data: TCreateData<T> & { id: string }
  path: string
}): Promise<T> => {
  const now = Timestamp.now()
  await setDoc(doc(firestore, path, data.id), { ...data, ...writeTimestamps() })
  return { ...data, createdAt: now, updatedAt: now } as T
}

const BATCH_CHUNK_SIZE = 500
const IN_QUERY_CHUNK_SIZE = 30

const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

const findExistingIds = async ({
  ids,
  path
}: {
  ids: string[]
  path: string
}): Promise<Set<string>> => {
  const results = await Promise.all(
    chunk(ids, IN_QUERY_CHUNK_SIZE).map(async (idsChunk) => {
      const q = query(
        collection(firestore, path),
        where(documentId(), 'in', idsChunk)
      )
      const { docs } = await getDocs(q)
      return docs.map((docSnap) => docSnap.id)
    })
  )
  return new Set(results.flat())
}

const commitInChunks = async (
  items: Array<{
    id: string
    ref: ReturnType<typeof doc>
    data: object
    options?: Parameters<ReturnType<typeof writeBatch>['set']>[2]
  }>,
  defaultOptions?: Parameters<ReturnType<typeof writeBatch>['set']>[2]
) => {
  for (let i = 0; i < items.length; i += BATCH_CHUNK_SIZE) {
    const batch = writeBatch(firestore)
    items.slice(i, i + BATCH_CHUNK_SIZE).forEach(({ ref, data, options }) => {
      batch.set(ref, data, options ?? defaultOptions ?? {})
    })
    await batch.commit()
  }
}

const createManyWithIds = async <T>({
  data,
  path
}: {
  data: Array<TCreateData<T> & { id: string }>
  path: string
}): Promise<T[]> => {
  const now = Timestamp.now()
  await commitInChunks(
    data.map((item) => ({
      id: item.id,
      ref: doc(firestore, path, item.id),
      data: { ...item, ...writeTimestamps() }
    }))
  )
  return data.map((item) => ({
    ...item,
    createdAt: now,
    updatedAt: now
  })) as T[]
}

const upsertManyWithIds = async <T>({
  data,
  path,
  updateFields
}: {
  data: Array<TCreateData<T> & { id: string }>
  path: string
  updateFields: string[]
}): Promise<void> => {
  const existingIds = await findExistingIds({
    ids: data.map((item) => item.id),
    path
  })

  await commitInChunks(
    data.map((item) => {
      const isNew = !existingIds.has(item.id)
      return {
        id: item.id,
        ref: doc(firestore, path, item.id),
        data: {
          ...item,
          ...(isNew ? { createdAt: serverTimestamp() } : {}),
          updatedAt: serverTimestamp()
        },
        options: {
          mergeFields: [
            ...updateFields,
            'updatedAt',
            ...(isNew ? ['createdAt'] : [])
          ]
        }
      }
    })
  )
}

const createMany = async <T>({
  data,
  path
}: {
  data: TCreateData<T[]>
  path: string
}): Promise<T[]> => {
  const now = Timestamp.now()
  const ids = data.map(() => crypto.randomUUID())
  await commitInChunks(
    data.map((item, i) => ({
      id: ids[i],
      ref: doc(firestore, path, ids[i]),
      data: { ...item, id: ids[i], ...writeTimestamps() }
    }))
  )
  return data.map((item, i) => ({
    ...item,
    id: ids[i],
    createdAt: now,
    updatedAt: now
  })) as T[]
}

const update = async <T>({
  data,
  path
}: {
  data: TUpdateData<T>
  path: string
}): Promise<T> => {
  if (Array.isArray(data)) {
    throw new InternalServerError({ cause: 'Data must be an object' })
  }
  const now = Timestamp.now()
  await updateDoc(doc(firestore, path, data.id), {
    ...data,
    updatedAt: serverTimestamp()
  })
  return { ...data, updatedAt: now } as T
}

const updateMany = async <T>({
  data,
  path
}: {
  data: TUpdateData<T[]>
  path: string
}): Promise<T[]> => {
  const now = Timestamp.now()
  for (let i = 0; i < data.length; i += BATCH_CHUNK_SIZE) {
    const batch = writeBatch(firestore)
    data.slice(i, i + BATCH_CHUNK_SIZE).forEach((item) => {
      batch.update(doc(firestore, path, item.id), {
        ...item,
        updatedAt: serverTimestamp()
      })
    })
    await batch.commit()
  }
  return data.map((item) => ({ ...item, updatedAt: now })) as T[]
}

const deleteUniqueById = async ({
  id,
  path
}: {
  id: string
  path: string
}): Promise<string> => {
  await deleteDoc(doc(firestore, path, id))
  return id
}

const deleteMany = async ({
  ids,
  path
}: {
  ids: string[]
  path: string
}): Promise<string[]> => {
  for (let i = 0; i < ids.length; i += BATCH_CHUNK_SIZE) {
    const batch = writeBatch(firestore)
    ids.slice(i, i + BATCH_CHUNK_SIZE).forEach((id) => {
      batch.delete(doc(firestore, path, id))
    })
    await batch.commit()
  }
  return ids
}

export const database = {
  findUniqueById,
  findMany,
  create,
  createWithId,
  createMany,
  createManyWithIds,
  upsertManyWithIds,
  update,
  updateMany,
  deleteUniqueById,
  deleteMany
}
