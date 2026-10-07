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

import type { TCreateData, TUpdateData } from '@/types/generics'
import { chunk, mapWithConcurrencyLimit } from '@/utils/concurrency'

import { InternalServerError } from './errors'
import { firestore } from './firebase-config'

const findUniqueById = async <T>({
  id,
  path
}: {
  id: string
  path: string
}): Promise<T | null> => {
  const snapshot = await getDoc(doc(firestore, path, id))
  return snapshot.exists() ? { ...(snapshot.data() as T), id } : null
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
  const data = docs.map((snapshot) => ({
    id: snapshot.id,
    ...snapshot.data()
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
  const ref = doc(collection(firestore, path))
  const now = Timestamp.now()
  await setDoc(ref, { ...data, id: ref.id, ...writeTimestamps() })
  return { ...data, id: ref.id, createdAt: now, updatedAt: now } as T
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
// Um catálogo grande (ex: 9 mil produtos) gera centenas de chunks de 30 ids —
// disparar todos de uma vez satura a conexão com o Firestore (emulador trava,
// stream WebChannel derruba). Limita quantas queries ficam em voo ao mesmo
// tempo, sem perder o paralelismo entre chunks.
const CONCURRENT_QUERY_LIMIT = 10

const findExistingIds = async ({
  ids,
  path
}: {
  ids: string[]
  path: string
}): Promise<Set<string>> => {
  const results = await mapWithConcurrencyLimit(
    chunk(ids, IN_QUERY_CHUNK_SIZE),
    CONCURRENT_QUERY_LIMIT,
    async (idsChunk) => {
      const q = query(
        collection(firestore, path),
        where(documentId(), 'in', idsChunk)
      )
      const { docs } = await getDocs(q)
      return docs.map((snapshot) => snapshot.id)
    }
  )
  return new Set(results.flat())
}

const commitInChunks = async (
  items: Array<{
    id: string
    ref: ReturnType<typeof doc>
    data: object
    options?: Parameters<ReturnType<typeof writeBatch>['set']>[2]
  }>
) => {
  for (const itemsChunk of chunk(items, BATCH_CHUNK_SIZE)) {
    const batch = writeBatch(firestore)
    for (const { ref, data, options = {} } of itemsChunk) {
      batch.set(ref, data, options)
    }
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
          ...(isNew && { createdAt: serverTimestamp() }),
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
    data.map((item, index) => ({
      id: ids[index],
      ref: doc(firestore, path, ids[index]),
      data: { ...item, id: ids[index], ...writeTimestamps() }
    }))
  )
  return data.map((item, index) => ({
    ...item,
    id: ids[index],
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
  for (const dataChunk of chunk(data, BATCH_CHUNK_SIZE)) {
    const batch = writeBatch(firestore)
    for (const item of dataChunk) {
      batch.update(doc(firestore, path, item.id), {
        ...item,
        updatedAt: serverTimestamp()
      })
    }
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
  for (const idsChunk of chunk(ids, BATCH_CHUNK_SIZE)) {
    const batch = writeBatch(firestore)
    for (const id of idsChunk) {
      batch.delete(doc(firestore, path, id))
    }
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
