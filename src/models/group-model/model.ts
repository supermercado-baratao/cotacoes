import { database, getUserPath } from '@/infra'
import type { TCreateData, TUpdateData } from '@/types'

import type { TGroup } from './types'

const PATH = 'groups'

const create = (data: TCreateData<TGroup>): Promise<TGroup> =>
  database.create({ path: getUserPath(PATH), data })

const findMany = (): Promise<TGroup[]> =>
  database.findMany<TGroup>({ path: getUserPath(PATH) })

const update = (data: TUpdateData<TGroup>): Promise<TGroup> =>
  database.update({ path: getUserPath(PATH), data })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: getUserPath(PATH), id })

export const groupModel = { create, findMany, update, deleteUniqueById }
