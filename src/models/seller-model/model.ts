import { database, getUserPath } from '@/infra'
import type { TCreateData, TUpdateData } from '@/types'

import { type TSeller } from './types'

const create = (data: TCreateData<TSeller>): Promise<TSeller> =>
  database.create({ path: getUserPath('sellers'), data })

const findMany = (): Promise<TSeller[]> =>
  database.findMany({ path: getUserPath('sellers') })

const update = (data: TUpdateData<TSeller>): Promise<TSeller> =>
  database.update({ path: getUserPath('sellers'), data })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: getUserPath('sellers'), id })

export const sellerModel = { create, findMany, update, deleteUniqueById }
