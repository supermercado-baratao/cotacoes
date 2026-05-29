import { useQueries } from '@tanstack/react-query'
import { useEffect } from 'react'

import {
  familyModel,
  orderModel,
  productModel,
  quoteModel,
  sellerModel,
  supplierModel
} from '@/models'
import { useAlertStore, useAppStore } from '@/stores'

export const useDataFetch = () => {
  const { alert } = useAlertStore()
  const quoteId = useAppStore((state) => state.quoteId)

  const queries = useQueries({
    queries: [
      { queryKey: ['products'], queryFn: productModel.findMany },
      { queryKey: ['suppliers'], queryFn: supplierModel.findMany },
      { queryKey: ['sellers'], queryFn: sellerModel.findMany },
      { queryKey: ['families'], queryFn: familyModel.findMany },
      { queryKey: ['quotes'], queryFn: quoteModel.findMany },
      {
        queryKey: ['orders', quoteId],
        queryFn: () => orderModel.findManyByQuoteId(quoteId!),
        enabled: !!quoteId
      }
    ]
  })

  const [
    { data: products },
    { data: suppliers },
    { data: sellers },
    { data: families },
    { data: quotes },
    { data: ordersByQuoteId }
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

  return {
    products,
    suppliers,
    sellers,
    families,
    quotes,
    ordersByQuoteId
  }
}
