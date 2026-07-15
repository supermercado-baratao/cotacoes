import { useMutation, useQueryClient } from '@tanstack/react-query'

import { sellerModel } from '@/models'
import { useAlertStore, useCallbackStore } from '@/stores'

import { removeFromArrayCache, upsertInArrayCache } from './query-cache'

const QUERY_KEY = ['sellers']

export const useSellerMutation = () => {
  const { alert } = useAlertStore()
  const { handleSuccessCallbacks, handleErrorCallbacks } = useCallbackStore()

  const queryClient = useQueryClient()

  const { mutate: createSeller } = useMutation({
    mutationFn: sellerModel.create,
    onSuccess: (seller) => {
      upsertInArrayCache(queryClient, QUERY_KEY, seller)
      alert({ severity: 'success', title: 'Vendedor criado com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao criar vendedor' })
      handleErrorCallbacks()
    }
  })

  const { mutate: updateSeller } = useMutation({
    mutationFn: sellerModel.update,
    onSuccess: (seller) => {
      upsertInArrayCache(queryClient, QUERY_KEY, seller)
      alert({ severity: 'success', title: 'Vendedor atualizado com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao atualizar vendedor' })
      handleErrorCallbacks()
    }
  })

  const { mutate: deleteSeller } = useMutation({
    mutationFn: sellerModel.deleteUniqueById,
    onSuccess: (id) => {
      removeFromArrayCache(queryClient, QUERY_KEY, id)
      alert({ severity: 'success', title: 'Vendedor excluído com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao excluir vendedor' })
      handleErrorCallbacks()
    }
  })

  return { createSeller, updateSeller, deleteSeller }
}
