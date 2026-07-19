import { database, getUserPath } from '@/infra'
import type { TCreateDataWithId, TUpdateData } from '@/types'

import { type TSupplier } from './types'

const PATH = 'suppliers'

const create = (data: TCreateDataWithId<TSupplier>): Promise<TSupplier> =>
  database.createWithId({
    path: getUserPath(PATH),
    data
  })

const createMany = (
  data: TCreateDataWithId<TSupplier>[]
): Promise<TSupplier[]> =>
  database.createManyWithIds<TSupplier>({
    path: getUserPath(PATH),
    data
  })

const upsertMany = (data: TCreateDataWithId<TSupplier>[]): Promise<void> =>
  database.upsertManyWithIds<TSupplier>({
    path: getUserPath(PATH),
    data,
    updateFields: [
      'id',
      'tradeName',
      'legalName',
      'cnpj',
      'phone',
      'vrCreatedAt'
    ]
  })

const findMany = (): Promise<TSupplier[]> =>
  database.findMany({ path: getUserPath(PATH) })

const update = (data: TUpdateData<TSupplier>): Promise<TSupplier> =>
  database.update({ path: getUserPath(PATH), data })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: getUserPath(PATH), id })

export const supplierModel = {
  create,
  createMany,
  upsertMany,
  findMany,
  update,
  deleteUniqueById
}
