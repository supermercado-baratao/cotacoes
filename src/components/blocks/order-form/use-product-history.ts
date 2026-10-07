import dayjs from 'dayjs'
import { useMemo } from 'react'

import { useAppStore } from '@/stores/use-app-store'

export type THistoryRow = {
  id: string
  date: string
  price: number
  quantity: number
  packing: string
  supplierName: string
  sellerName: string | null
  observations: string | null
}

export const useProductHistory = () => {
  const { suppliers, sellers, quoteId, ordersByProductId } = useAppStore()

  const history: THistoryRow[] = useMemo(
    () =>
      (ordersByProductId ?? [])
        .filter((o) => o.quoteId !== quoteId)
        .toSorted((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
        .map((order) => ({
          id: order.id,
          date: order.date,
          price: order.price,
          quantity: order.quantity,
          packing: order.packing,
          supplierName:
            suppliers?.find((s) => s.id === order.supplierId)?.tradeName ?? '—',
          sellerName:
            sellers?.find((s) => s.id === order.sellerId)?.name ?? null,
          observations: order.observations
        })),
    [ordersByProductId, suppliers, sellers, quoteId]
  )

  return { history }
}
