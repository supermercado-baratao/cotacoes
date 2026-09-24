import { database, getUserPath } from '@/infra'
import type { TCreateData, TCreateDataWithId, TUpdateData } from '@/types'

import { type TDepartment } from './types'

const PATH = 'departments'

const create = (data: TCreateData<TDepartment>): Promise<TDepartment> =>
  database.create({ path: getUserPath(PATH), data })

const upsertMany = (data: TCreateDataWithId<TDepartment>[]): Promise<void> =>
  database.upsertManyWithIds<TDepartment>({
    path: getUserPath(PATH),
    data,
    updateFields: ['id', 'description']
  })

const findMany = (): Promise<TDepartment[]> =>
  database.findMany({ path: getUserPath(PATH) })

const update = (data: TUpdateData<TDepartment>): Promise<TDepartment> =>
  database.update({ path: getUserPath(PATH), data })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: getUserPath(PATH), id })

export const departmentModel = {
  create,
  upsertMany,
  findMany,
  update,
  deleteUniqueById
}
