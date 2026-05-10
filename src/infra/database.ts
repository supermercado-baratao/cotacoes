import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  type QueryConstraint,
  setDoc,
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
  const timestamp = Date.now()
  const value = {
    ...data,
    id: docRef.id,
    createdAt: timestamp,
    updatedAt: timestamp
  }
  await setDoc(docRef, value)
  return value as T
}

const createWithId = async <T>({
  data,
  path
}: {
  data: TCreateData<T> & { id: string }
  path: string
}): Promise<T> => {
  const timestamp = Date.now()
  const value = {
    ...data,
    createdAt: timestamp,
    updatedAt: timestamp
  }
  await setDoc(doc(firestore, path, data.id), value)
  return value as T
}

const createMany = async <T>({
  data,
  path
}: {
  data: TCreateData<T[]>
  path: string
}): Promise<T[]> => {
  const batch = writeBatch(firestore)
  const values: object[] = []
  data.forEach((value) => {
    const id = crypto.randomUUID()
    const ref = doc(firestore, path, id)
    const timestamp = Date.now()
    const newValue = {
      ...value,
      id,
      createdAt: timestamp,
      updatedAt: timestamp
    }
    values.push(newValue)
    batch.set(ref, newValue)
  })
  await batch.commit()
  return values as T[]
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
  const value = {
    ...data,
    updatedAt: Date.now()
  } as object
  await updateDoc(doc(firestore, path, data.id), value)
  return value as T
}

const updateMany = async <T>({
  data,
  path
}: {
  data: TUpdateData<T[]>
  path: string
}): Promise<T[]> => {
  const batch = writeBatch(firestore)
  const values: object[] = []
  data.forEach((value) => {
    const ref = doc(firestore, path, value.id)
    const timestamp = Date.now()
    const updatedValue = { ...value, updatedAt: timestamp }
    values.push(updatedValue)
    batch.update(ref, updatedValue)
  })
  await batch.commit()
  return values as T[]
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
  update,
  updateMany,
  deleteUniqueById,
  deleteMany
}
