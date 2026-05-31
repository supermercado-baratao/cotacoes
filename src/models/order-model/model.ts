import { where } from 'firebase/firestore'

import { database, getUserPath } from '@/infra'
import type { TCreateData, TUpdateData } from '@/types'

import type { TOrder } from './types'

const create = (data: TCreateData<TOrder>): Promise<TOrder> =>
  database.create({ path: getUserPath('orders'), data })

const findManyByQuoteId = (quoteId: string): Promise<TOrder[]> =>
  database.findMany({
    path: getUserPath('orders'),
    queryConstraints: [where('quoteId', '==', quoteId)]
  })

const findManyByProductId = (productId: string): Promise<TOrder[]> =>
  database.findMany({
    path: getUserPath('orders'),
    queryConstraints: [where('productId', '==', productId)]
  })

const update = (data: TUpdateData<TOrder>): Promise<TOrder> =>
  database.update({ path: getUserPath('orders'), data })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: getUserPath('orders'), id })

export const orderModel = {
  create,
  findManyByQuoteId,
  findManyByProductId,
  update,
  deleteUniqueById
}
