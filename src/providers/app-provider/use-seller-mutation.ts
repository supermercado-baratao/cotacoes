import { useMutation, useQueryClient } from '@tanstack/react-query'

import { sellerModel } from '@/models'
import { useAlertStore, useCallbackStore } from '@/stores'

export const useSellerMutation = () => {
  const { alert } = useAlertStore()
  const { handleSuccessCallbacks, handleErrorCallbacks } = useCallbackStore()

  const queryClient = useQueryClient()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['sellers'] })

  const { mutate: createSeller } = useMutation({
    mutationFn: sellerModel.create,
    onSuccess: () => {
      invalidate()
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
    onSuccess: () => {
      invalidate()
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
    onSuccess: () => {
      invalidate()
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
