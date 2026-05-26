import { database } from '@/infra'
import type { TCreateData, TUpdateData } from '@/types'

import { type TProduct } from './types'

const PATH = 'products'

const create = (data: TCreateData<TProduct>): Promise<TProduct> =>
  database.create({ path: PATH, data })

const findMany = (): Promise<TProduct[]> =>
  database.findMany<TProduct>({ path: PATH })

const update = (data: TUpdateData<TProduct>): Promise<TProduct> =>
  database.update({ path: PATH, data })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: PATH, id })

export const productModel = {
  create,
  findMany,
  update,
  deleteUniqueById
}
