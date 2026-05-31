import { database, getUserPath } from '@/infra'
import type { TCreateData, TUpdateData } from '@/types'

import { type TSupplier } from './types'

const create = (data: TCreateData<TSupplier>): Promise<TSupplier> =>
  database.create({ path: getUserPath('suppliers'), data })

const findMany = (): Promise<TSupplier[]> =>
  database.findMany({ path: getUserPath('suppliers') })

const update = (data: TUpdateData<TSupplier>): Promise<TSupplier> =>
  database.update({ path: getUserPath('suppliers'), data })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: getUserPath('suppliers'), id })

export const supplierModel = { create, findMany, update, deleteUniqueById }
