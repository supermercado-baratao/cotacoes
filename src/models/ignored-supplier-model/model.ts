import { database, getUserPath } from '@/infra'
import type { TCreateDataWithId } from '@/types'

import { type TIgnoredSupplier } from './types'

const PATH = 'ignoredSuppliers'

const create = (
  data: TCreateDataWithId<TIgnoredSupplier>
): Promise<TIgnoredSupplier> =>
  database.createWithId({ path: getUserPath(PATH), data })

const findMany = (): Promise<TIgnoredSupplier[]> =>
  database.findMany<TIgnoredSupplier>({ path: getUserPath(PATH) })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: getUserPath(PATH), id })

export const ignoredSupplierModel = {
  create,
  findMany,
  deleteUniqueById
}
