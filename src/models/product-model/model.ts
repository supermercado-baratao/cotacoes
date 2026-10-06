import { database } from '@/infra/database'
import { getUserPath } from '@/infra/firebase-config'
import type { TCreateDataWithId, TUpdateData } from '@/types/generics'

import { type TProduct } from './types'

const PATH = 'products'

export const UPSERT_MANY_UPDATABLE_FIELDS: Array<
  keyof TCreateDataWithId<TProduct>
> = [
  'description',
  'price',
  'familyId',
  'barcodes',
  'packTypes',
  'packQuantities',
  'supplierPackings',
  'departmentId',
  'department',
  'section',
  'group',
  'stock',
  'vrCreatedAt',
  'costWithTax'
]

const create = (data: TCreateDataWithId<TProduct>): Promise<TProduct> =>
  database.createWithId({
    path: getUserPath(PATH),
    data
  })

const createMany = (data: TCreateDataWithId<TProduct>[]): Promise<TProduct[]> =>
  database.createManyWithIds<TProduct>({
    path: getUserPath(PATH),
    data
  })

const upsertMany = (data: TCreateDataWithId<TProduct>[]): Promise<void> =>
  database.upsertManyWithIds<TProduct>({
    path: getUserPath(PATH),
    data,
    updateFields: UPSERT_MANY_UPDATABLE_FIELDS
  })

const findMany = (): Promise<TProduct[]> =>
  database.findMany({ path: getUserPath(PATH) })

const update = (data: TUpdateData<TProduct>): Promise<TProduct> =>
  database.update({ path: getUserPath(PATH), data })

const updateMany = (data: TUpdateData<TProduct[]>): Promise<TProduct[]> =>
  database.updateMany({ path: getUserPath(PATH), data })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: getUserPath(PATH), id })

export const productModel = {
  create,
  createMany,
  upsertMany,
  findMany,
  update,
  updateMany,
  deleteUniqueById
}
