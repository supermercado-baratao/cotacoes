import { database, getUserPath } from '@/infra'
import type { TCreateData } from '@/types'

import type { TSettings } from './types'

const PATH = 'settings'
const SETTINGS_ID = 'general'

const find = (): Promise<TSettings | null> =>
  database.findUniqueById<TSettings>({
    id: SETTINGS_ID,
    path: getUserPath(PATH)
  })

const upsert = async (
  data: Partial<TCreateData<TSettings>>
): Promise<TSettings> => {
  const existing = await find()

  if (existing) {
    return database.update<TSettings>({
      path: getUserPath(PATH),
      data: { ...existing, ...data }
    })
  }

  return database.createWithId<TSettings>({
    path: getUserPath(PATH),
    data: {
      id: SETTINGS_ID,
      pdfDepartmentOrder: [],
      marginTolerance: { below: 0, above: 0 },
      departmentMarginTolerances: {},
      lastCatalogImportAt: null,
      lastInvoiceImportAt: null,
      ...data
    }
  })
}

export const settingsModel = {
  find,
  upsert
}
