import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { TOrder, TQuote } from '@/models'
import { orderModel, quoteModel } from '@/models'
import { useAlertStore, useCallbackStore } from '@/stores'
import type { TCreateData, TUpdateData } from '@/types'

import { removeOrderFromCache } from './order-cache'
import { removeFromArrayCache, upsertInArrayCache } from './query-cache'
import { useEntityMutation } from './use-entity-mutation'

const withOrderCleanupSuffix = (
  baseTitle: string,
  deletedCount: number
): string => {
  if (!deletedCount) return baseTitle
  const suffix =
    deletedCount === 1
      ? '1 pedido órfão foi excluído junto'
      : `${deletedCount} pedidos órfãos foram excluídos junto`
  return `${baseTitle} ${suffix}.`
}

export const useQuoteMutation = () => {
  const { alert } = useAlertStore()
  const { handleSuccessCallbacks, handleErrorCallbacks } = useCallbackStore()
  const queryClient = useQueryClient()

  const { createItem: createQuote } = useEntityMutation<
    TQuote,
    TCreateData<TQuote>,
    TUpdateData<TQuote>
  >({
    queryKey: ['quotes'],
    create: quoteModel.create,
    update: quoteModel.update,
    deleteUniqueById: quoteModel.deleteUniqueById,
    labels: {
      created: 'Cotação criada com sucesso!',
      createError: 'Erro ao criar cotação',
      updated: 'Cotação atualizada com sucesso!',
      updateError: 'Erro ao atualizar cotação',
      deleted: 'Cotação excluída com sucesso!',
      deleteError: 'Erro ao excluir cotação'
    }
  })

  const { mutate: updateQuoteMutate } = useMutation({
    mutationFn: async ({
      quote,
      ordersToDelete
    }: {
      quote: TUpdateData<TQuote>
      ordersToDelete: TOrder[]
    }) => {
      if (ordersToDelete.length) {
        await orderModel.deleteMany(ordersToDelete.map((o) => o.id))
      }
      const updatedQuote = await quoteModel.update(quote)
      return { quote: updatedQuote, deletedOrders: ordersToDelete }
    },
    onSuccess: ({ quote, deletedOrders }) => {
      deletedOrders.forEach((order) => removeOrderFromCache(queryClient, order))
      upsertInArrayCache(queryClient, ['quotes'], quote)
      alert({
        severity: 'success',
        title: withOrderCleanupSuffix(
          'Cotação atualizada com sucesso!',
          deletedOrders.length
        )
      })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao atualizar cotação' })
      handleErrorCallbacks()
    }
  })

  const { mutate: deleteQuoteMutate } = useMutation({
    mutationFn: async ({
      id,
      ordersToDelete
    }: {
      id: string
      ordersToDelete: TOrder[]
    }) => {
      if (ordersToDelete.length) {
        await orderModel.deleteMany(ordersToDelete.map((o) => o.id))
      }
      await quoteModel.deleteUniqueById(id)
      return { id, deletedOrders: ordersToDelete }
    },
    onSuccess: ({ id, deletedOrders }) => {
      deletedOrders.forEach((order) => removeOrderFromCache(queryClient, order))
      removeFromArrayCache(queryClient, ['quotes'], id)
      alert({
        severity: 'success',
        title: withOrderCleanupSuffix(
          'Cotação excluída com sucesso!',
          deletedOrders.length
        )
      })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao excluir cotação' })
      handleErrorCallbacks()
    }
  })

  const updateQuote = (
    quote: TUpdateData<TQuote>,
    ordersToDelete: TOrder[] = []
  ) => updateQuoteMutate({ quote, ordersToDelete })

  const deleteQuote = (id: string, ordersToDelete: TOrder[] = []) =>
    deleteQuoteMutate({ id, ordersToDelete })

  return { createQuote, updateQuote, deleteQuote }
}
