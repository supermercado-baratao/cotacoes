import { useMutation, useQueryClient } from '@tanstack/react-query'

import { orderModel } from '@/models'
import { useAlertStore, useCallbackStore } from '@/stores'

export const useOrderMutation = () => {
  const { alert } = useAlertStore()
  const { handleSuccessCallbacks, handleErrorCallbacks } = useCallbackStore()

  const queryClient = useQueryClient()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['orders'] })

  const { mutate: createOrder } = useMutation({
    mutationFn: orderModel.create,
    onSuccess: () => {
      invalidate()
      alert({ severity: 'success', title: 'Pedido criado com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao criar pedido' })
      handleErrorCallbacks()
    }
  })

  const { mutate: updateOrder } = useMutation({
    mutationFn: orderModel.update,
    onSuccess: () => {
      invalidate()
      alert({ severity: 'success', title: 'Pedido atualizado com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao atualizar pedido' })
      handleErrorCallbacks()
    }
  })

  const { mutate: deleteOrder } = useMutation({
    mutationFn: orderModel.deleteUniqueById,
    onSuccess: () => {
      invalidate()
      alert({ severity: 'success', title: 'Pedido excluído com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao excluir pedido' })
      handleErrorCallbacks()
    }
  })

  return { createOrder, updateOrder, deleteOrder }
}
