import { database } from '@/infra/database'
import { getUserPath } from '@/infra/firebase-config'
import type { TCreateData, TUpdateData } from '@/types/generics'

import { type TPackingDefault } from './types'

const PATH = 'packingDefaults'

const create = (data: TCreateData<TPackingDefault>): Promise<TPackingDefault> =>
  database.create({ path: getUserPath(PATH), data })

const findMany = (): Promise<TPackingDefault[]> =>
  database.findMany({ path: getUserPath(PATH) })

const update = (data: TUpdateData<TPackingDefault>): Promise<TPackingDefault> =>
  database.update({ path: getUserPath(PATH), data })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: getUserPath(PATH), id })

export const packingDefaultModel = {
  create,
  findMany,
  update,
  deleteUniqueById
}
