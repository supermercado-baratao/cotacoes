import { database, getUserPath } from '@/infra'
import type { TCreateData, TUpdateData } from '@/types'

import { type TPackingDefault } from './types'

const PATH = 'packingDefaults'

const create = (data: TCreateData<TPackingDefault>): Promise<TPackingDefault> =>
  database.create({ path: getUserPath(PATH), data })

const findMany = (): Promise<TPackingDefault[]> =>
  database.findMany({ path: getUserPath(PATH) })

const update = (data: TUpdateData<TPackingDefault>): Promise<TPackingDefault> =>
  database.update({ path: getUserPath(PATH), data })

export const packingDefaultModel = { create, findMany, update }
