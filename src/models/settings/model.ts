import { database } from '@/infra/database'
import { getUserPath } from '@/infra/firebase-config'
import type { TCreateData } from '@/types/generics'

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
      // Matches DEFAULT_MARGIN_TOLERANCE: inert floor/ceiling until the user
      // sets real values.
      marginTolerance: { below: 0, above: 100 },
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
