import { useQueries } from '@tanstack/react-query'
import { useEffect } from 'react'

import { familyModel, productModel, sellerModel, supplierModel } from '@/models'
import { useAlertStore, useAppStore } from '@/stores'

export const useDataFetch = () => {
  const { alert } = useAlertStore()
  const historySelection = useAppStore((state) => state.historySelection)

  const queries = useQueries({
    queries: [
      { queryKey: ['products'], queryFn: productModel.findMany },
      {
        queryKey: [
          'product-history',
          historySelection?.productId,
          historySelection?.field
        ],
        queryFn: () =>
          productModel.findManyPriceHistory(
            historySelection!.productId,
            historySelection!.field
          ),
        enabled: !!historySelection
      },
      { queryKey: ['suppliers'], queryFn: supplierModel.findMany },
      { queryKey: ['sellers'], queryFn: sellerModel.findMany },
      { queryKey: ['families'], queryFn: familyModel.findMany }
    ]
  })

  const [
    { data: products },
    { data: productHistory },
    { data: suppliers },
    { data: sellers },
    { data: families }
  ] = queries

  const isError = queries.some((query) => query.isError)

  useEffect(() => {
    if (isError) {
      alert({
        severity: 'error',
        title: 'Erro ao buscar dados',
        description: 'Atualize a página ou tente novamente mais tarde'
      })
    }
  }, [isError, alert])

  return { products, productHistory, suppliers, sellers, families }
}
