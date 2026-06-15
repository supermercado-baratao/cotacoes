import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

import orchestrator from '@/tests/orchestrator'

beforeAll(() => {
  orchestrator.connectToEmulators()
})

afterEach(() => {
  cleanup()
})

afterAll(() => {
  orchestrator.clearEmulatorData()
})
