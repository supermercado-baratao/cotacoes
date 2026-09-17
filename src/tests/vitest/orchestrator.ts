import { getData } from '@/components/blocks/catalog-import/utils'
import { importModel } from '@/models'

import { resetDatabaseMock } from './_mocks/database'
import {
  createFakeUser,
  resetAuthMock,
  setAuthMockUser
} from './_mocks/firebase-auth'
import { resetFirestoreMock } from './_mocks/firestore'
import { readMockFile } from './_utils/read-mock-file'

export const createUser = () => {
  const user = createFakeUser()
  setAuthMockUser(user)
  return user
}

export const populateDatabase = async (): Promise<void> => {
  const buffer = await readMockFile('import-data.xlsx')
  const file = new File([new Uint8Array(buffer)], 'import-data.xlsx')
  const data = await getData(file)
  await importModel.import(data)
}

export const clearData = () => {
  resetDatabaseMock()
  resetAuthMock()
  resetFirestoreMock()
}
