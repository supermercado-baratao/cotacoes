import { database } from '@/infra'
import type { TCreateData, TUpdateData } from '@/types'

import { type TSeller } from './types'

const path = 'sellers'

const create = async (data: TCreateData<TSeller>): Promise<TSeller> => {
  return database.create({ path, data })
}

const findMany = async (): Promise<TSeller[]> => {
  return database.findMany<TSeller>({ path })
}

const update = async (data: TUpdateData<TSeller>): Promise<TSeller> => {
  return database.update<TSeller>({ path, data })
}

const deleteUniqueById = async (id: string): Promise<string> => {
  return database.deleteUniqueById({ path, id })
}

export const sellerModel = {
  create,
  findMany,
  update,
  deleteUniqueById
}
