import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invoiceModel } from '@/models/invoice-model/model'
import {
  type TInvoice,
  type TInvoiceItemMatchStatus
} from '@/models/invoice-model/types'
import { orderModel } from '@/models/order-model/model'
import { type TOrder } from '@/models/order-model/types'
import { useAlertStore } from '@/stores/use-alert-store'
import { useAppStore } from '@/stores/use-app-store'
import { useCallbackStore } from '@/stores/use-callback-store'
import type { TCreateData } from '@/types/generics'

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
              productId: order.productId,
              orderId: createdOrder.id,
              matchStatus: 'matched' as TInvoiceItemMatchStatus,
              priceDivergence: item.unitPrice - order.price,
              quantityDivergence: item.quantity - order.quantity
            }
          : item
      )
      try {
        const updatedInvoice = await invoiceModel.update({
          ...invoice,
          items: updatedItems
        })
        return {
          order: createdOrder,
          invoice: updatedInvoice,
          linked: true as const
        }
      } catch {
        return { order: createdOrder, invoice: null, linked: false as const }
      }
    },
    onSuccess: ({ order, invoice, linked }) => {
      upsertOrderInCache(queryClient, order)
      if (linked && invoice) {
        upsertInvoiceInCache(queryClient, invoice, invoiceDateRange)
        alert({ severity: 'success', title: 'Pedido criado com sucesso!' })
        handleSuccessCallbacks()
        return
      }
      alert({
        severity: 'error',
        title:
          'Pedido criado, mas não foi possível vinculá-lo à nota. Tente vincular novamente.'
      })
      handleErrorCallbacks()
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
          productId: match.order.productId,
          orderId: match.createdOrder.id,
          matchStatus: 'matched' as TInvoiceItemMatchStatus,
          priceDivergence: item.unitPrice - match.order.price,
          quantityDivergence: item.quantity - match.order.quantity
        }
      })
      try {
        const updatedInvoice = await invoiceModel.update({
          ...invoice,
          items: updatedItems
        })
        return {
          orders: createdOrders,
          invoice: updatedInvoice,
          linked: true as const
        }
      } catch {
        return { orders: createdOrders, invoice: null, linked: false as const }
      }
    },
    onSuccess: ({ orders, invoice, linked }) => {
      orders.forEach((order) => upsertOrderInCache(queryClient, order))
      const n = orders.length
      if (linked && invoice) {
        upsertInvoiceInCache(queryClient, invoice, invoiceDateRange)
        alert({
          severity: 'success',
          title: `${n} ${n === 1 ? 'pedido vinculado' : 'pedidos vinculados'} com sucesso!`
        })
        handleSuccessCallbacks()
        return
      }
      alert({
        severity: 'error',
        title: `${n} ${n === 1 ? 'pedido criado' : 'pedidos criados'}, mas não foi possível vinculá-los à nota. Tente vincular novamente.`
      })
      handleErrorCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao vincular pedidos' })
      handleErrorCallbacks()
    }
  })

  return { createOrderWithInvoiceLink, createOrdersBatchWithInvoiceLink }
}
