import { database, getUserPath } from '@/infra'
import type { TUpdateData } from '@/types'

import type { TInvoice } from './types'

const createMany = (
  data: Array<Omit<TInvoice, 'createdAt' | 'updatedAt'>>
): Promise<TInvoice[]> =>
  database.createManyWithIds<TInvoice>({
    path: getUserPath('invoices'),
    data
  })

const create = async (
  data: Omit<TInvoice, 'createdAt' | 'updatedAt'>
): Promise<TInvoice> => {
  const existing = await database.findUniqueById<TInvoice>({
    id: data.id,
    path: getUserPath('invoices')
  })
  if (existing) throw new Error('Nota fiscal já importada anteriormente')
  return database.createWithId<TInvoice>({
    data,
    path: getUserPath('invoices')
  })
}

const findMany = (): Promise<TInvoice[]> =>
  database.findMany<TInvoice>({ path: getUserPath('invoices') })

const update = (data: TUpdateData<TInvoice>): Promise<TInvoice> =>
  database.update({ path: getUserPath('invoices'), data })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: getUserPath('invoices'), id })

export const invoiceModel = {
  create,
  createMany,
  findMany,
  update,
  deleteUniqueById
}
