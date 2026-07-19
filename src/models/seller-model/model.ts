import { database, getUserPath } from '@/infra'
import type { TCreateData, TUpdateData } from '@/types'

import { type TSeller } from './types'

const PATH = 'sellers'

const create = (data: TCreateData<TSeller>): Promise<TSeller> =>
  database.create({ path: getUserPath(PATH), data })

const findMany = (): Promise<TSeller[]> =>
  database.findMany({ path: getUserPath(PATH) })

const update = (data: TUpdateData<TSeller>): Promise<TSeller> =>
  database.update({ path: getUserPath(PATH), data })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: getUserPath(PATH), id })

export const sellerModel = { create, findMany, update, deleteUniqueById }
