import { database } from '@/infra'
import type { TCreateData, TUpdateData } from '@/types'

import type { TQuote } from './types'

const PATH = 'quotes'

const create = (data: TCreateData<TQuote>): Promise<TQuote> =>
  database.create({ path: PATH, data })

const findMany = (): Promise<TQuote[]> =>
  database.findMany({
    path: PATH
  })

const update = (data: TUpdateData<TQuote>): Promise<TQuote> =>
  database.update({ path: PATH, data })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: PATH, id })

export const quoteModel = {
  create,
  findMany,
  update,
  deleteUniqueById
}
