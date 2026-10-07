import { describe, expect, test } from 'vitest'

import { parseNfe } from '@/pages/invoices/utils'

describe('parseNfe', () => {
  test('rejects malformed XML', () => {
    expect(() => parseNfe('<nfeProc><NFe>', [])).toThrow('Arquivo XML inválido')
  })
})
