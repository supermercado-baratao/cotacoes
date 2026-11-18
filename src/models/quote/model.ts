import { database } from '@/infra/database'
import { getUserPath } from '@/infra/firebase-config'
import type { TCreateData, TUpdateData } from '@/types/generics'

import type { TQuote } from './types'

const PATH = 'quotes'

const create = (data: TCreateData<TQuote>): Promise<TQuote> =>
  database.create({ path: getUserPath(PATH), data })

const findMany = (): Promise<TQuote[]> =>
  database.findMany({ path: getUserPath(PATH) })

const update = (data: TUpdateData<TQuote>): Promise<TQuote> =>
  database.update({ path: getUserPath(PATH), data })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: getUserPath(PATH), id })

export const quoteModel = { create, findMany, update, deleteUniqueById }
