import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  invoiceModel,
  orderModel,
  type TInvoice,
  type TInvoiceItemMatchStatus,
  type TOrder
} from '@/models'
import { useAlertStore, useAppStore, useCallbackStore } from '@/stores'
import type { TCreateData } from '@/types'

import { upsertInvoiceInCache } from './invoice-cache'
import { upsertOrderInCache } from './order-cache'

type TPayload = {
  order: TCreateData<TOrder>
  invoice: TInvoice
  itemNumber: number
}

type TBatchPayload = {
  invoice: TInvoice
  matches: Array<{ itemNumber: number; order: TCreateData<TOrder> }>
}

export const useInvoiceOrderLinkMutation = () => {
  const { alert } = useAlertStore()
  const { handleSuccessCallbacks, handleErrorCallbacks } = useCallbackStore()
  const invoiceDateRange = useAppStore((state) => state.invoiceDateRange)
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
      const updatedInvoice = await invoiceModel.update({
        ...invoice,
        items: updatedItems
      })
      return { order: createdOrder, invoice: updatedInvoice }
    },
    onSuccess: ({ order, invoice }) => {
      upsertOrderInCache(queryClient, order)
      upsertInvoiceInCache(queryClient, invoice, invoiceDateRange)
      alert({ severity: 'success', title: 'Pedido criado com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao criar pedido' })
      handleErrorCallbacks()
    }
  })

  const { mutate: createOrdersBatchWithInvoiceLink } = useMutation({
    mutationFn: async ({ invoice, matches }: TBatchPayload) => {
      const createdOrders = await orderModel.createMany(
        matches.map((match) => match.order)
      )
      const matchByItemNumber = new Map(
        matches.map((match, i) => [
          match.itemNumber,
          { order: match.order, createdOrder: createdOrders[i] }
        ])
      )
      const updatedItems = invoice.items.map((item) => {
        const match = matchByItemNumber.get(item.itemNumber)
        if (!match) return item
        return {
          ...item,
          orderId: match.createdOrder.id,
          matchStatus: 'matched' as TInvoiceItemMatchStatus,
          priceDivergence: item.unitPrice - match.order.price,
          quantityDivergence: item.quantity - match.order.quantity
        }
      })
      const updatedInvoice = await invoiceModel.update({
        ...invoice,
        items: updatedItems
      })
      return { orders: createdOrders, invoice: updatedInvoice }
    },
    onSuccess: ({ orders, invoice }) => {
      orders.forEach((order) => upsertOrderInCache(queryClient, order))
      upsertInvoiceInCache(queryClient, invoice, invoiceDateRange)
      const n = orders.length
      alert({
        severity: 'success',
        title: `${n} ${n === 1 ? 'pedido vinculado' : 'pedidos vinculados'} com sucesso!`
      })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao vincular pedidos' })
      handleErrorCallbacks()
    }
  })

  return { createOrderWithInvoiceLink, createOrdersBatchWithInvoiceLink }
}
