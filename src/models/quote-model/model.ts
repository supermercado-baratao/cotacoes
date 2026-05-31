import { database, getUserPath } from '@/infra'
import type { TCreateData, TUpdateData } from '@/types'

import type { TQuote } from './types'

const create = (data: TCreateData<TQuote>): Promise<TQuote> =>
  database.create({ path: getUserPath('quotes'), data })

const findMany = (): Promise<TQuote[]> =>
  database.findMany({ path: getUserPath('quotes') })

const update = (data: TUpdateData<TQuote>): Promise<TQuote> =>
  database.update({ path: getUserPath('quotes'), data })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: getUserPath('quotes'), id })

export const quoteModel = { create, findMany, update, deleteUniqueById }
