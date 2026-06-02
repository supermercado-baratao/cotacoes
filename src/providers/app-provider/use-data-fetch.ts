import { useQueries } from '@tanstack/react-query'
import { useEffect } from 'react'

import {
  familyModel,
  groupModel,
  orderModel,
  productModel,
  quoteModel,
  sellerModel,
  supplierModel
} from '@/models'
import { useAlertStore, useAppStore, useAuthStore } from '@/stores'

export const useDataFetch = () => {
  const { alert } = useAlertStore()
  const quoteId = useAppStore((state) => state.quoteId)
  const historyProductId = useAppStore((state) => state.historyProductId)
  const user = useAuthStore((state) => state.user)

  const queries = useQueries({
    queries: [
      {
        queryKey: ['products'],
        queryFn: productModel.findMany,
        enabled: !!user
      },
      {
        queryKey: ['suppliers'],
        queryFn: supplierModel.findMany,
        enabled: !!user
      },
      { queryKey: ['sellers'], queryFn: sellerModel.findMany, enabled: !!user },
      {
        queryKey: ['families'],
        queryFn: familyModel.findMany,
        enabled: !!user
      },
      { queryKey: ['groups'], queryFn: groupModel.findMany, enabled: !!user },
      { queryKey: ['quotes'], queryFn: quoteModel.findMany, enabled: !!user },
      {
        queryKey: ['orders', quoteId],
        queryFn: () => orderModel.findManyByQuoteId(quoteId!),
        enabled: !!quoteId && !!user
      },
      {
        queryKey: ['orders', 'product', historyProductId],
        queryFn: () => orderModel.findManyByProductId(historyProductId!),
        enabled: !!historyProductId && !!user
      }
    ]
  })

  const [
    { data: products },
    { data: suppliers },
    { data: sellers },
    { data: families },
    { data: groups },
    { data: quotes },
    { data: ordersByQuoteId },
    { data: ordersByProductId }
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
    groups,
    quotes,
    ordersByQuoteId,
    ordersByProductId
  }
}
