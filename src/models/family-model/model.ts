import { database, getUserPath } from '@/infra'
import type { TCreateDataWithId, TUpdateData } from '@/types'

import { type TFamily } from './types'

const create = (data: TCreateDataWithId<TFamily>): Promise<TFamily> =>
  database.createWithId({
    path: getUserPath('families'),
    data
  })

const createMany = (data: TCreateDataWithId<TFamily>[]): Promise<TFamily[]> =>
  database.createManyWithIds<TFamily>({
    path: getUserPath('families'),
    data
  })

const upsertMany = (data: TCreateDataWithId<TFamily>[]): Promise<void> =>
  database.upsertManyWithIds<TFamily>({
    path: getUserPath('families'),
    data,
    updateFields: ['id', 'description']
  })

const findMany = (): Promise<TFamily[]> =>
  database.findMany({ path: getUserPath('families') })

const update = (data: TUpdateData<TFamily>): Promise<TFamily> =>
  database.update({ path: getUserPath('families'), data })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: getUserPath('families'), id })

export const familyModel = {
  create,
  createMany,
  upsertMany,
  findMany,
  update,
  deleteUniqueById
}
