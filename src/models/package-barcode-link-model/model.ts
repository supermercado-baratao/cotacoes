import { database, getUserPath } from '@/infra'
import type { TCreateDataWithId } from '@/types'

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
