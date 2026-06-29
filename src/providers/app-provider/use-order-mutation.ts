import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { TOrder } from '@/models'
import { orderModel } from '@/models'
import { useAlertStore, useCallbackStore } from '@/stores'
import type { TCreateData } from '@/types'

export const useOrderMutation = () => {
  const { alert } = useAlertStore()
  const { handleSuccessCallbacks, handleErrorCallbacks } = useCallbackStore()

  const queryClient = useQueryClient()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['orders'] })

  const { mutate: createOrdersBatch } = useMutation({
    mutationFn: (orders: TCreateData<TOrder>[]) =>
      orderModel.createMany(orders),
    onSuccess: (orders) => {
      invalidate()
      const n = orders.length
      alert({
        severity: 'success',
        title: `${n} ${n === 1 ? 'pedido criado' : 'pedidos criados'} com sucesso!`
      })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao criar pedidos' })
      handleErrorCallbacks()
    }
  })

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

  return { createOrder, createOrdersBatch, updateOrder, deleteOrder }
}
