import { database, getUserPath } from '@/infra'
import type { TCreateData, TUpdateData } from '@/types'

import { type TProduct } from './types'

const create = (data: TCreateData<TProduct>): Promise<TProduct> =>
  database.create({ path: getUserPath('products'), data })

const findMany = (): Promise<TProduct[]> =>
  database.findMany({ path: getUserPath('products') })

const update = (data: TUpdateData<TProduct>): Promise<TProduct> =>
  database.update({ path: getUserPath('products'), data })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: getUserPath('products'), id })

export const productModel = { create, findMany, update, deleteUniqueById }
