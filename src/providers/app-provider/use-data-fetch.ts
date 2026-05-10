import { useQueries } from '@tanstack/react-query'
import { useEffect } from 'react'

import { productModel } from '@/models'
import { useAlertStore } from '@/stores'

export const useDataFetch = () => {
  const { alert } = useAlertStore()

  const queries = useQueries({
    queries: [
      {
        queryKey: ['products'],
        queryFn: productModel.findMany
      }
    ]
  })

  const [{ data: products }] = queries

  const isError = queries.some((query) => query.isError)
  const errors = queries.filter((query) => query.error)

  useEffect(() => {
    if (isError) {
      console.error(errors)
      alert({
        severity: 'error',
        title: 'Erro ao buscar dados',
        description: 'Atualize a página ou tente novamente mais tarde'
      })
    }
  }, [isError, errors, alert])

  return {
    products
  }
}
