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

const upsert = async (data: TCreateData<TSettings>): Promise<TSettings> => {
  const existing = await find()

  if (existing) {
    return database.update<TSettings>({
      path: getUserPath(PATH),
      data: { id: SETTINGS_ID, createdAt: existing.createdAt, ...data }
    })
  }

  return database.createWithId<TSettings>({
    path: getUserPath(PATH),
    data: { id: SETTINGS_ID, ...data }
  })
}

export const settingsModel = {
  find,
  upsert
}
