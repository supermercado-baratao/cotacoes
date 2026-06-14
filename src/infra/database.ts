import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  type QueryConstraint,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
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

const create = async <T>({
  data,
  path
}: {
  data: TCreateData<T>
  path: string
}): Promise<T> => {
  const docRef = doc(collection(firestore, path))
  const now = Timestamp.now()
  await setDoc(docRef, {
    ...data,
    id: docRef.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
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
  await setDoc(doc(firestore, path, data.id), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
  return { ...data, createdAt: now, updatedAt: now } as T
}

const BATCH_CHUNK_SIZE = 500

const commitInChunks = async (
  items: Array<{ id: string; ref: ReturnType<typeof doc>; data: object }>,
  options?: Parameters<ReturnType<typeof writeBatch>['set']>[2]
) => {
  for (let i = 0; i < items.length; i += BATCH_CHUNK_SIZE) {
    const batch = writeBatch(firestore)
    items.slice(i, i + BATCH_CHUNK_SIZE).forEach(({ ref, data }) => {
      batch.set(ref, data, options ?? {})
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
      data: {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
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
}): Promise<void> =>
  commitInChunks(
    data.map((item) => ({
      id: item.id,
      ref: doc(firestore, path, item.id),
      data: { ...item, updatedAt: serverTimestamp() }
    })),
    { mergeFields: [...updateFields, 'updatedAt'] }
  )

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
      data: {
        ...item,
        id: ids[i],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
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
  const batch = writeBatch(firestore)
  data.forEach((item) => {
    batch.update(doc(firestore, path, item.id), {
      ...item,
      updatedAt: serverTimestamp()
    })
  })
  await batch.commit()
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
  const batch = writeBatch(firestore)
  ids.forEach((id) => {
    const ref = doc(firestore, path, id)
    batch.delete(ref)
  })
  await batch.commit()
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
