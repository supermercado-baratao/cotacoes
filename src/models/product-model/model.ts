import { database } from '@/infra'
import type { TCreateData, TUpdateData } from '@/types'

import { type TProduct } from './types'

const path = 'products'

const create = async (data: TCreateData<TProduct>): Promise<TProduct> => {
  return database.create({ path, data })
}

const findMany = async (): Promise<TProduct[]> => {
  return database.findMany<TProduct>({ path })
}

const update = async (data: TUpdateData<TProduct>): Promise<TProduct> => {
  return database.update<TProduct>({ path, data })
}

const deleteUniqueById = async (id: string): Promise<string> => {
  return database.deleteUniqueById({ path, id })
}

export const productModel = {
  create,
  findMany,
  update,
  deleteUniqueById
}
