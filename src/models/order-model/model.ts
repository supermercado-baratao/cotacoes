import { where } from 'firebase/firestore'

import { database } from '@/infra'
import type { TCreateData, TUpdateData } from '@/types'

import type { TOrder } from './types'

const PATH = 'orders'

const create = (data: TCreateData<TOrder>): Promise<TOrder> =>
  database.create({ path: PATH, data })

const findManyByQuoteId = (quoteId: string): Promise<TOrder[]> =>
  database.findMany({
    path: PATH,
    queryConstraints: [where('quoteId', '==', quoteId)]
  })

const findManyByProductId = (productId: string): Promise<TOrder[]> =>
  database.findMany({
    path: PATH,
    queryConstraints: [where('productId', '==', productId)]
  })

const update = (data: TUpdateData<TOrder>): Promise<TOrder> =>
  database.update({ path: PATH, data })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: PATH, id })

export const orderModel = {
  create,
  findManyByQuoteId,
  findManyByProductId,
  update,
  deleteUniqueById
}
