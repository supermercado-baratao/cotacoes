import { database, getUserPath } from '@/infra'
import type { TCreateData, TUpdateData } from '@/types'

import { type TFamily } from './types'

const create = (data: TCreateData<TFamily>): Promise<TFamily> =>
  database.create({ path: getUserPath('families'), data })

const findMany = (): Promise<TFamily[]> =>
  database.findMany({ path: getUserPath('families') })

const update = (data: TUpdateData<TFamily>): Promise<TFamily> =>
  database.update({ path: getUserPath('families'), data })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: getUserPath('families'), id })

export const familyModel = { create, findMany, update, deleteUniqueById }
