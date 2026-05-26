import { database } from '@/infra'
import type { TCreateData, TUpdateData } from '@/types'

import { type TSupplier } from './types'

const PATH = 'suppliers'

const create = (data: TCreateData<TSupplier>): Promise<TSupplier> =>
  database.create({ path: PATH, data })

const findMany = (): Promise<TSupplier[]> =>
  database.findMany<TSupplier>({ path: PATH })

const update = (data: TUpdateData<TSupplier>): Promise<TSupplier> =>
  database.update({ path: PATH, data })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: PATH, id })

export const supplierModel = {
  create,
  findMany,
  update,
  deleteUniqueById
}
