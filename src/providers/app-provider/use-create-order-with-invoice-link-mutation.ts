import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  invoiceModel,
  orderModel,
  type TInvoice,
  type TInvoiceItemMatchStatus,
  type TOrder
} from '@/models'
import { useAlertStore, useCallbackStore } from '@/stores'
import type { TCreateData } from '@/types'

type TPayload = {
  order: TCreateData<TOrder>
  invoice: TInvoice
  itemNumber: number
}

export const useCreateOrderWithInvoiceLinkMutation = () => {
  const { alert } = useAlertStore()
  const { handleSuccessCallbacks, handleErrorCallbacks } = useCallbackStore()
  const queryClient = useQueryClient()

  const { mutate: createOrderWithInvoiceLink } = useMutation({
    mutationFn: async ({ order, invoice, itemNumber }: TPayload) => {
      const createdOrder = await orderModel.create(order)
      const updatedItems = invoice.items.map((item) =>
        item.itemNumber === itemNumber
          ? {
              ...item,
              orderId: createdOrder.id,
              matchStatus: 'matched' as TInvoiceItemMatchStatus,
              priceDivergence: item.unitPrice - order.price,
              quantityDivergence: item.quantity - order.quantity
            }
          : item
      )
      await invoiceModel.update({ ...invoice, items: updatedItems })
      return createdOrder
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      alert({ severity: 'success', title: 'Pedido criado com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao criar pedido' })
      handleErrorCallbacks()
    }
  })

  return { createOrderWithInvoiceLink }
}
