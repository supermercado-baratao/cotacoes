import { database } from '@/infra'
import type { TCreateData, TUpdateData } from '@/types'

import { type TFamily } from './types'

const path = 'families'

const create = async (data: TCreateData<TFamily>): Promise<TFamily> => {
  return database.create({ path, data })
}

const findMany = async (): Promise<TFamily[]> => {
  return database.findMany<TFamily>({ path })
}

const update = async (data: TUpdateData<TFamily>): Promise<TFamily> => {
  return database.update<TFamily>({ path, data })
}

const deleteUniqueById = async (id: string): Promise<string> => {
  return database.deleteUniqueById({ path, id })
}

export const familyModel = {
  create,
  findMany,
  update,
  deleteUniqueById
}
