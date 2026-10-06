import { database } from '@/infra/database'
import { getUserPath } from '@/infra/firebase-config'
import type { TCreateDataWithId } from '@/types/generics'

import type { TPriceAdjustment } from './types'

const PATH = 'price-adjustments'

const findMany = (): Promise<TPriceAdjustment[]> =>
  database.findMany<TPriceAdjustment>({ path: getUserPath(PATH) })

// A coleção guarda só o resultado da última importação — cada nova
// importação substitui o período anterior por inteiro, não acumula.
const replaceAll = async (
  data: TCreateDataWithId<TPriceAdjustment>[]
): Promise<TPriceAdjustment[]> => {
  const existing = await findMany()
  if (existing.length) {
    await database.deleteMany({
      path: getUserPath(PATH),
      ids: existing.map((item) => item.id)
    })
  }
  if (!data.length) return []
  return database.createManyWithIds<TPriceAdjustment>({
    path: getUserPath(PATH),
    data
  })
}

export const priceAdjustmentModel = {
  findMany,
  replaceAll
}
