import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll } from 'vitest'

import { resetDatabaseMock } from '@/tests/_mocks/database'
import { resetAuthMock } from '@/tests/_mocks/firebase-auth'
import { resetFirestoreMock } from '@/tests/_mocks/firestore'

// beforeAll (não beforeEach): os fluxos de teste seguem um roteiro sequencial
// dentro de cada arquivo (estado acumulado entre testes), então os mocks só
// devem ser resetados uma vez por arquivo, não a cada teste.
beforeAll(() => {
  resetDatabaseMock()
  resetAuthMock()
  resetFirestoreMock()
})

afterEach(() => {
  cleanup()
})
