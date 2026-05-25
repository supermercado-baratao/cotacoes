import { database } from '@/infra'
import type { TCreateData, TUpdateData } from '@/types'

import { type TFamily } from './types'

const PATH = 'families'

const create = async (data: TCreateData<TFamily>): Promise<TFamily> => {
  return database.create({ path: PATH, data })
}

const findMany = async (): Promise<TFamily[]> => {
  return database.findMany<TFamily>({ path: PATH })
}

const update = async (data: TUpdateData<TFamily>): Promise<TFamily> => {
  return database.update<TFamily>({ path: PATH, data })
}

const deleteUniqueById = async (id: string): Promise<string> => {
  return database.deleteUniqueById({ path: PATH, id })
}

export const familyModel = {
  create,
  findMany,
  update,
  deleteUniqueById
}
