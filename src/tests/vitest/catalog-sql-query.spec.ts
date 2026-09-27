import { describe, expect, test } from 'vitest'

import {
  buildQuery,
  MAX_QUERY_LENGTH
} from '@/components/blocks/catalog-import/_components/sql-query/query'

describe('catalog SQL query', () => {
  test('fits the VR query text limit', () => {
    expect(buildQuery('2026-01-01').length).toBeLessThanOrEqual(
      MAX_QUERY_LENGTH
    )
  })
})
