import { useMutation, useQueryClient } from '@tanstack/react-query'

import { ignoredProductModel } from '@/models/ignored-product-model/model'
import { useAlertStore } from '@/stores/use-alert-store'
import { useCallbackStore } from '@/stores/use-callback-store'

import { removeFromArrayCache, upsertInArrayCache } from './query-cache'

const QUERY_KEY = ['ignored-products']

export const useIgnoredProductMutation = () => {
  const { alert } = useAlertStore()
  const { handleSuccessCallbacks, handleErrorCallbacks } = useCallbackStore()
  const queryClient = useQueryClient()

  const { mutate: createIgnoredProduct } = useMutation({
    mutationFn: ignoredProductModel.create,
    onSuccess: (ignoredProduct) => {
      upsertInArrayCache(queryClient, QUERY_KEY, ignoredProduct)
      alert({ severity: 'success', title: 'Produto ignorado com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao ignorar produto' })
      handleErrorCallbacks()
    }
  })

  const { mutate: deleteIgnoredProduct } = useMutation({
    mutationFn: ignoredProductModel.deleteUniqueById,
    onSuccess: (id) => {
      removeFromArrayCache(queryClient, QUERY_KEY, id)
      alert({
        severity: 'success',
        title: 'Produto removido da lista de ignorados!'
      })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({
        severity: 'error',
        title: 'Erro ao remover produto da lista de ignorados'
      })
      handleErrorCallbacks()
    }
  })

  return { createIgnoredProduct, deleteIgnoredProduct }
}
