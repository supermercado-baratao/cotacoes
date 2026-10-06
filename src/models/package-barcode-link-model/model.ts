import { database } from '@/infra/database'
import { getUserPath } from '@/infra/firebase-config'
import type { TCreateDataWithId } from '@/types/generics'

import { type TPackageBarcodeLink } from './types'

const PATH = 'packageBarcodeLinks'

const create = (
  data: TCreateDataWithId<TPackageBarcodeLink>
): Promise<TPackageBarcodeLink> =>
  database.createWithId({ path: getUserPath(PATH), data })

const findMany = (): Promise<TPackageBarcodeLink[]> =>
  database.findMany<TPackageBarcodeLink>({ path: getUserPath(PATH) })

export const packageBarcodeLinkModel = {
  create,
  findMany
}
