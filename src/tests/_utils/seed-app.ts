import { importModel } from '@/models'
import { getData } from '@/pages/import/utils'

import { createFakeUser, setAuthMockUser } from '../_mocks/firebase-auth'
import { readMockFile } from './read-mock-file'

export const signInFakeUser = () => setAuthMockUser(createFakeUser())

export const populateDatabaseFromFixture = async (): Promise<void> => {
  const buffer = await readMockFile('import-data.xlsx')
  const file = new File([new Uint8Array(buffer)], 'import-data.xlsx')
  const data = await getData(file)
  await importModel.import(data)
}
