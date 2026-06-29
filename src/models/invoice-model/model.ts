import { database } from '@/infra'
import type { TUpdateData } from '@/types'

import type { TInvoice } from './types'

const PATH = 'invoices'

const createMany = (
  data: Array<Omit<TInvoice, 'createdAt' | 'updatedAt'>>
): Promise<TInvoice[]> =>
  database.createManyWithIds<TInvoice>({ path: PATH, data })

const create = async (
  data: Omit<TInvoice, 'createdAt' | 'updatedAt'>
): Promise<TInvoice> => {
  const existing = await database.findUniqueById<TInvoice>({
    id: data.id,
    path: PATH
  })
  if (existing) throw new Error('Nota fiscal já importada anteriormente')
  return database.createWithId<TInvoice>({ data, path: PATH })
}

const findMany = (): Promise<TInvoice[]> =>
  database.findMany<TInvoice>({ path: PATH })

const update = (data: TUpdateData<TInvoice>): Promise<TInvoice> =>
  database.update({ path: PATH, data })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: PATH, id })

export const invoiceModel = {
  create,
  createMany,
  findMany,
  update,
  deleteUniqueById
}
