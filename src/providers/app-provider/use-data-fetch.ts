import { useQueries } from '@tanstack/react-query'
import { useEffect } from 'react'

import { familyModel, productModel, sellerModel, supplierModel } from '@/models'
import { useAlertStore } from '@/stores'

export const useDataFetch = () => {
  const { alert } = useAlertStore()

  const queries = useQueries({
    queries: [
      { queryKey: ['products'], queryFn: productModel.findMany },
      { queryKey: ['suppliers'], queryFn: supplierModel.findMany },
      { queryKey: ['sellers'], queryFn: sellerModel.findMany },
      { queryKey: ['families'], queryFn: familyModel.findMany }
    ]
  })

  const [
    { data: products },
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

  return { products, suppliers, sellers, families }
}
