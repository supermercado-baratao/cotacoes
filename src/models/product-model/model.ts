import { database } from '@/infra'
import type { TCreateData, TUpdateData } from '@/types'

import { type TProduct } from './types'

const PATH = 'products'

const create = async (data: TCreateData<TProduct>): Promise<TProduct> => {
  return database.create({ path: PATH, data })
}

const findMany = async (): Promise<TProduct[]> => {
  return database.findMany<TProduct>({ path: PATH })
}

const update = async (data: TUpdateData<TProduct>): Promise<TProduct> => {
  return database.update({ path: PATH, data })
}

const deleteUniqueById = async (id: string): Promise<string> => {
  return database.deleteUniqueById({ path: PATH, id })
}

export const productModel = {
  create,
  findMany,
  update,
  deleteUniqueById
}
