import { where } from 'firebase/firestore'

import { database } from '@/infra/database'
import { getUserPath } from '@/infra/firebase-config'
import type { TCreateData, TUpdateData } from '@/types/generics'
import { chunk, mapWithConcurrencyLimit } from '@/utils/concurrency'

import type { TOrder } from './types'

const PATH = 'orders'
const IN_QUERY_CHUNK_SIZE = 30
const CONCURRENT_QUERY_LIMIT = 10

const create = (data: TCreateData<TOrder>): Promise<TOrder> =>
  database.create({ path: getUserPath(PATH), data })

const createMany = (data: TCreateData<TOrder>[]): Promise<TOrder[]> =>
  database.createMany<TOrder>({ path: getUserPath(PATH), data })

const findManyByQuoteId = (quoteId: string): Promise<TOrder[]> =>
  database.findMany({
    path: getUserPath(PATH),
    queryConstraints: [where('quoteId', '==', quoteId)]
  })

const findManyByProductId = (productId: string): Promise<TOrder[]> =>
  database.findMany({
    path: getUserPath(PATH),
    queryConstraints: [where('productId', '==', productId)]
  })

const findManyByProductIds = async (
  productIds: string[]
): Promise<TOrder[]> => {
  const uniqueIds = [...new Set(productIds)]
  if (!uniqueIds.length) return []

  const results = await mapWithConcurrencyLimit(
    chunk(uniqueIds, IN_QUERY_CHUNK_SIZE),
    CONCURRENT_QUERY_LIMIT,
    (idsChunk) =>
      database.findMany<TOrder>({
        path: getUserPath(PATH),
        queryConstraints: [where('productId', 'in', idsChunk)]
      })
  )
  return results.flat()
}

const update = (data: TUpdateData<TOrder>): Promise<TOrder> =>
  database.update({ path: getUserPath(PATH), data })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: getUserPath(PATH), id })

const deleteMany = (ids: string[]): Promise<string[]> =>
  database.deleteMany({ path: getUserPath(PATH), ids })

export const orderModel = {
  create,
  createMany,
  findManyByQuoteId,
  findManyByProductId,
  findManyByProductIds,
  update,
  deleteUniqueById,
  deleteMany
}
