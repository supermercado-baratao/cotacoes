import { useMemo } from 'react'

import type { TProductHistoryType } from '@/models'
import { useAppStore } from '@/stores'
import { formatCurrency, formatNumericValue } from '@/utils'

const fieldLabels: Record<TProductHistoryType, string> = {
  price: 'Preço',
  purchasePrice: 'Custo',
  quantity: 'Quantidade'
}

export const useHistoryHandler = ({
  field
}: {
  field: TProductHistoryType | null
}) => {
  const productHistory = useAppStore((state) => state.productHistory)

  const title = field ? `Histórico de ${fieldLabels[field]}` : 'Histórico'

  const formatValue = field === 'quantity' ? formatNumericValue : formatCurrency

  const items = useMemo(
    () =>
      productHistory?.map((h) => ({
        date: new Date(h.createdAt).toLocaleDateString('pt-BR'),
        oldValue: formatValue(h.oldValue),
        newValue: formatValue(h.newValue)
      })) ?? [],
    [productHistory, formatValue]
  )

  return { title, items }
}
