import { database, getUserPath } from '@/infra'
import type { TCreateData, TUpdateData } from '@/types'

import { type TProduct } from './types'

const create = (data: TCreateData<TProduct>): Promise<TProduct> =>
  database.createWithId({
    path: getUserPath('products'),
    data: { ...data, id: data.vrId }
  })

const createMany = (data: TCreateData<TProduct>[]): Promise<TProduct[]> =>
  database.createManyWithIds<TProduct>({
    path: getUserPath('products'),
    data: data.map((item) => ({ ...item, id: item.vrId }))
  })

const upsertMany = (data: TCreateData<TProduct>[]): Promise<void> =>
  database.upsertManyWithIds<TProduct>({
    path: getUserPath('products'),
    data: data.map((item) => ({ ...item, id: item.vrId })),
    updateFields: [
      'id',
      'vrId',
      'description',
      'price',
      'familyId',
      'supplierIds'
    ]
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
