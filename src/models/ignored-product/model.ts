import { database } from '@/infra/database'
import { getUserPath } from '@/infra/firebase-config'
import type { TCreateDataWithId } from '@/types/generics'

import { type TIgnoredProduct } from './types'

const PATH = 'ignoredProducts'

const create = (
  data: TCreateDataWithId<TIgnoredProduct>
): Promise<TIgnoredProduct> =>
  database.createWithId({ path: getUserPath(PATH), data })

const findMany = (): Promise<TIgnoredProduct[]> =>
  database.findMany<TIgnoredProduct>({ path: getUserPath(PATH) })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: getUserPath(PATH), id })

export const ignoredProductModel = {
  create,
  findMany,
  deleteUniqueById
}
