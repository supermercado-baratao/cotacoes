import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invoiceModel, orderModel, type TInvoice, type TOrder } from '@/models'
import { useAlertStore, useCallbackStore } from '@/stores'
import type { TCreateData } from '@/types'

type TImportPayload = {
  nfes: Array<Omit<TInvoice, 'createdAt' | 'updatedAt'>>
  quoteId: string
  orders: TCreateData<TOrder>[]
}

export const useImportNfOrdersMutation = () => {
  const { alert } = useAlertStore()
  const { handleSuccessCallbacks, handleErrorCallbacks } = useCallbackStore()
  const queryClient = useQueryClient()

  const { mutate: importNfsWithOrders } = useMutation({
    mutationFn: async ({ nfes, quoteId, orders }: TImportPayload) => {
      await invoiceModel.createMany(nfes.map((nfe) => ({ ...nfe, quoteId })))
      return orderModel.createMany(orders)
    },
    onSuccess: (orders) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      const n = orders.length
      alert({
        severity: 'success',
        title: `${n} ${n === 1 ? 'pedido criado' : 'pedidos criados'} com sucesso!`
      })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({
        severity: 'error',
        title: 'Erro ao importar notas e criar pedidos'
      })
      handleErrorCallbacks()
    }
  })

  return { importNfsWithOrders }
}
