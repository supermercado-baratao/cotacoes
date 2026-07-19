import { where } from 'firebase/firestore'

import { database, getUserPath } from '@/infra'
import type { TCreateData, TUpdateData } from '@/types'

import type { TOrder } from './types'

const PATH = 'orders'

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

const update = (data: TUpdateData<TOrder>): Promise<TOrder> =>
  database.update({ path: getUserPath(PATH), data })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: getUserPath(PATH), id })

export const orderModel = {
  create,
  createMany,
  findManyByQuoteId,
  findManyByProductId,
  update,
  deleteUniqueById
}
