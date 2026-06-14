import { database, getUserPath } from '@/infra'
import type { TCreateData, TUpdateData } from '@/types'

import { type TFamily } from './types'

const create = (data: TCreateData<TFamily>): Promise<TFamily> =>
  database.createWithId({
    path: getUserPath('families'),
    data: { ...data, id: data.vrId }
  })

const createMany = (data: TCreateData<TFamily>[]): Promise<TFamily[]> =>
  database.createManyWithIds<TFamily>({
    path: getUserPath('families'),
    data: data.map((item) => ({ ...item, id: item.vrId }))
  })

const upsertMany = (data: TCreateData<TFamily>[]): Promise<void> =>
  database.upsertManyWithIds<TFamily>({
    path: getUserPath('families'),
    data: data.map((item) => ({ ...item, id: item.vrId })),
    updateFields: ['id', 'vrId', 'description']
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
