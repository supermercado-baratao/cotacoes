import { database, getUserPath } from '@/infra'
import type { TCreateDataWithId, TUpdateData } from '@/types'

import { type TProduct } from './types'

const create = (data: TCreateDataWithId<TProduct>): Promise<TProduct> =>
  database.createWithId({
    path: getUserPath('products'),
    data
  })

const createMany = (data: TCreateDataWithId<TProduct>[]): Promise<TProduct[]> =>
  database.createManyWithIds<TProduct>({
    path: getUserPath('products'),
    data
  })

const upsertMany = (data: TCreateDataWithId<TProduct>[]): Promise<void> =>
  database.upsertManyWithIds<TProduct>({
    path: getUserPath('products'),
    data,
    updateFields: ['id', 'description', 'price', 'familyId', 'supplierIds']
  })

const findMany = (): Promise<TProduct[]> =>
  database.findMany({ path: getUserPath('products') })

const update = (data: TUpdateData<TProduct>): Promise<TProduct> =>
  database.update({ path: getUserPath('products'), data })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: getUserPath('products'), id })

export const productModel = {
  create,
  createMany,
  upsertMany,
  findMany,
  update,
  deleteUniqueById
}
