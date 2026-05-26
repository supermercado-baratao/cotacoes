import { database } from '@/infra'
import type { TCreateData, TUpdateData } from '@/types'

import { type TFamily } from './types'

const PATH = 'families'

const create = (data: TCreateData<TFamily>): Promise<TFamily> =>
  database.create({ path: PATH, data })

const findMany = (): Promise<TFamily[]> =>
  database.findMany<TFamily>({ path: PATH })

const update = (data: TUpdateData<TFamily>): Promise<TFamily> =>
  database.update({ path: PATH, data })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: PATH, id })

export const familyModel = {
  create,
  findMany,
  update,
  deleteUniqueById
}
