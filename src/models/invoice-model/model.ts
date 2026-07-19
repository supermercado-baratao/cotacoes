import dayjs from 'dayjs'
import {
  doc,
  documentId,
  runTransaction,
  serverTimestamp,
  Timestamp,
  where
} from 'firebase/firestore'

import { ConflictError, database, firestore, getUserPath } from '@/infra'
import type { TUpdateData } from '@/types'

import type { TInvoice, TInvoiceDateRange } from './types'

const PATH = 'invoices'
const IN_QUERY_CHUNK_SIZE = 30

const findExistingIds = async (ids: string[]): Promise<Set<string>> => {
  const chunks: string[][] = []
  for (let i = 0; i < ids.length; i += IN_QUERY_CHUNK_SIZE) {
    chunks.push(ids.slice(i, i + IN_QUERY_CHUNK_SIZE))
  }
  const results = await Promise.all(
    chunks.map((chunkIds) =>
      database.findMany<TInvoice>({
        path: getUserPath(PATH),
        queryConstraints: [where(documentId(), 'in', chunkIds)]
      })
    )
  )
  return new Set(results.flat().map((invoice) => invoice.id))
}

const createMany = async (
  data: Array<Omit<TInvoice, 'createdAt' | 'updatedAt'>>
): Promise<TInvoice[]> => {
  const existingIds = await findExistingIds(data.map((item) => item.id))
  const newData = data.filter((item) => !existingIds.has(item.id))
  if (!newData.length) return []
  return database.createManyWithIds<TInvoice>({
    path: getUserPath(PATH),
    data: newData
  })
}

const create = async (
  data: Omit<TInvoice, 'createdAt' | 'updatedAt'>
): Promise<TInvoice> => {
  const now = Timestamp.now()
  const ref = doc(firestore, getUserPath(PATH), data.id)

  await runTransaction(firestore, async (transaction) => {
    const existing = await transaction.get(ref)
    if (existing.exists()) {
      throw new ConflictError({
        message: 'Nota fiscal já importada anteriormente'
      })
    }
    transaction.set(ref, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  })

  return { ...data, createdAt: now, updatedAt: now } as TInvoice
}

const findMany = ({
  startDate,
  endDate
}: TInvoiceDateRange): Promise<TInvoice[]> =>
  database.findMany<TInvoice>({
    path: getUserPath(PATH),
    queryConstraints: [
      where('emissionDate', '>=', startDate),
      where(
        'emissionDate',
        '<',
        dayjs(endDate).add(1, 'day').format('YYYY-MM-DD')
      )
    ]
  })

const update = (data: TUpdateData<TInvoice>): Promise<TInvoice> =>
  database.update({ path: getUserPath(PATH), data })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: getUserPath(PATH), id })

export const invoiceModel = {
  create,
  createMany,
  findMany,
  update,
  deleteUniqueById
}
