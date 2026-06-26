import { database, getUserPath } from '@/infra'
import type { TCreateDataWithId, TUpdateData } from '@/types'

import { type TSupplier } from './types'

const create = (data: TCreateDataWithId<TSupplier>): Promise<TSupplier> =>
  database.createWithId({
    path: getUserPath('suppliers'),
    data
  })

const createMany = (
  data: TCreateDataWithId<TSupplier>[]
): Promise<TSupplier[]> =>
  database.createManyWithIds<TSupplier>({
    path: getUserPath('suppliers'),
    data
  })

const upsertMany = (data: TCreateDataWithId<TSupplier>[]): Promise<void> =>
  database.upsertManyWithIds<TSupplier>({
    path: getUserPath('suppliers'),
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
  database.findMany({ path: getUserPath('suppliers') })

const update = (data: TUpdateData<TSupplier>): Promise<TSupplier> =>
  database.update({ path: getUserPath('suppliers'), data })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: getUserPath('suppliers'), id })

export const supplierModel = {
  create,
  createMany,
  upsertMany,
  findMany,
  update,
  deleteUniqueById
}
