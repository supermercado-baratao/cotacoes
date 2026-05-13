import { database } from '@/infra'
import type { TCreateData, TUpdateData } from '@/types'

import { type TSupplier } from './types'

const path = 'suppliers'

const create = async (data: TCreateData<TSupplier>): Promise<TSupplier> => {
  return database.create({ path, data })
}

const findMany = async (): Promise<TSupplier[]> => {
  return database.findMany<TSupplier>({ path })
}

const update = async (data: TUpdateData<TSupplier>): Promise<TSupplier> => {
  return database.update<TSupplier>({ path, data })
}

const deleteUniqueById = async (id: string): Promise<string> => {
  return database.deleteUniqueById({ path, id })
}

export const supplierModel = {
  create,
  findMany,
  update,
  deleteUniqueById
}
