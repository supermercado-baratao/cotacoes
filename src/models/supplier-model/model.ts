import { database, getUserPath } from '@/infra'
import type { TCreateData, TUpdateData } from '@/types'

import { type TSupplier } from './types'

const create = (data: TCreateData<TSupplier>): Promise<TSupplier> =>
  database.createWithId({
    path: getUserPath('suppliers'),
    data: { ...data, id: data.vrId }
  })

const createMany = (data: TCreateData<TSupplier>[]): Promise<TSupplier[]> =>
  database.createManyWithIds<TSupplier>({
    path: getUserPath('suppliers'),
    data: data.map((item) => ({ ...item, id: item.vrId }))
  })

const upsertMany = (data: TCreateData<TSupplier>[]): Promise<void> =>
  database.upsertManyWithIds<TSupplier>({
    path: getUserPath('suppliers'),
    data: data.map((item) => ({ ...item, id: item.vrId })),
    updateFields: ['id', 'vrId', 'tradeName', 'legalName', 'cnpj']
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
