import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterAll, afterEach } from 'vitest'

import orchestrator from '@/tests/orchestrator'

afterEach(() => {
  cleanup()
})

afterAll(() => {
  orchestrator.clearEmulatorData()
})
