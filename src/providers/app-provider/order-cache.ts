import type { QueryClient } from '@tanstack/react-query'

import type { TOrder } from '@/models'

import { removeFromArrayCache, upsertInArrayCache } from './query-cache'

export const upsertOrderInCache = (queryClient: QueryClient, order: TOrder) => {
  upsertInArrayCache(queryClient, ['orders', order.quoteId], order)
  upsertInArrayCache(queryClient, ['orders', 'product', order.productId], order)
}

export const removeOrderFromCache = (
  queryClient: QueryClient,
  order: Pick<TOrder, 'id' | 'quoteId' | 'productId'>
) => {
  removeFromArrayCache(queryClient, ['orders', order.quoteId], order.id)
  removeFromArrayCache(
    queryClient,
    ['orders', 'product', order.productId],
    order.id
  )
}
