import { database } from '@/infra/database'
import { getUserPath } from '@/infra/firebase-config'
import type { TCreateDataWithId, TUpdateData } from '@/types/generics'

import { type TFamily } from './types'

const PATH = 'families'

const create = (data: TCreateDataWithId<TFamily>): Promise<TFamily> =>
  database.createWithId({
    path: getUserPath(PATH),
    data
  })

const createMany = (data: TCreateDataWithId<TFamily>[]): Promise<TFamily[]> =>
  database.createManyWithIds<TFamily>({
    path: getUserPath(PATH),
    data
  })

const upsertMany = (data: TCreateDataWithId<TFamily>[]): Promise<void> =>
  database.upsertManyWithIds<TFamily>({
    path: getUserPath(PATH),
    data,
    updateFields: ['id', 'description']
  })

const findMany = (): Promise<TFamily[]> =>
  database.findMany({ path: getUserPath(PATH) })

const update = (data: TUpdateData<TFamily>): Promise<TFamily> =>
  database.update({ path: getUserPath(PATH), data })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: getUserPath(PATH), id })

export const familyModel = {
  create,
  createMany,
  upsertMany,
  findMany,
  update,
  deleteUniqueById
}
