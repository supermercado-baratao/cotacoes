import { useMutation, useQueryClient } from '@tanstack/react-query'

import { ignoredSupplierModel } from '@/models'
import { useAlertStore, useCallbackStore } from '@/stores'

import { removeFromArrayCache, upsertInArrayCache } from './query-cache'

const QUERY_KEY = ['ignored-suppliers']

export const useIgnoredSupplierMutation = () => {
  const { alert } = useAlertStore()
  const { handleSuccessCallbacks, handleErrorCallbacks } = useCallbackStore()
  const queryClient = useQueryClient()

  const { mutate: createIgnoredSupplier } = useMutation({
    mutationFn: ignoredSupplierModel.create,
    onSuccess: (ignoredSupplier) => {
      upsertInArrayCache(queryClient, QUERY_KEY, ignoredSupplier)
      alert({ severity: 'success', title: 'Fornecedor ignorado com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao ignorar fornecedor' })
      handleErrorCallbacks()
    }
  })

  const { mutate: deleteIgnoredSupplier } = useMutation({
    mutationFn: ignoredSupplierModel.deleteUniqueById,
    onSuccess: (id) => {
      removeFromArrayCache(queryClient, QUERY_KEY, id)
      alert({
        severity: 'success',
        title: 'Fornecedor removido da lista de ignorados!'
      })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({
        severity: 'error',
        title: 'Erro ao remover fornecedor da lista de ignorados'
      })
      handleErrorCallbacks()
    }
  })

  return { createIgnoredSupplier, deleteIgnoredSupplier }
}
