import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll } from 'vitest'

// Import direto dos _mocks (não via orchestrator.ts): garante que os
// vi.mock('firebase/auth'|'firebase/firestore'|'@/infra/database') registrem
// antes que qualquer outro import (ex: @/models, dentro do orchestrator)
// carregue os módulos reais. Ver [[project_testing_strategy_split]].
import { resetDatabaseMock } from '@/tests/vitest/_mocks/database'
import { resetAuthMock } from '@/tests/vitest/_mocks/firebase-auth'
import { resetFirestoreMock } from '@/tests/vitest/_mocks/firestore'

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
