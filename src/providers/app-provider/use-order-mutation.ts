import { useMutation, useQueryClient } from '@tanstack/react-query'

import { orderModel } from '@/models/order/model'
import type { TOrder } from '@/models/order/types'
import { useAlertStore } from '@/stores/use-alert-store'
import { useCallbackStore } from '@/stores/use-callback-store'
import type { TCreateData } from '@/types/generics'

import { removeOrderFromCache, upsertOrderInCache } from './order-cache'

export const useOrderMutation = () => {
  const { alert } = useAlertStore()
  const { handleSuccessCallbacks, handleErrorCallbacks } = useCallbackStore()

  const queryClient = useQueryClient()

  const { mutate: createOrdersBatch } = useMutation({
    mutationFn: (orders: TCreateData<TOrder>[]) =>
      orderModel.createMany(orders),
    onSuccess: (orders) => {
      for (const order of orders) upsertOrderInCache(queryClient, order)
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
    onSuccess: (order) => {
      upsertOrderInCache(queryClient, order)
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
    onSuccess: (order) => {
      upsertOrderInCache(queryClient, order)
      alert({ severity: 'success', title: 'Pedido atualizado com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao atualizar pedido' })
      handleErrorCallbacks()
    }
  })

  const { mutate: deleteOrder } = useMutation({
    mutationFn: (order: TOrder) => orderModel.deleteUniqueById(order.id),
    onSuccess: (_, order) => {
      removeOrderFromCache(queryClient, order)
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
