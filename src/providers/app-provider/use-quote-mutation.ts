import { useMutation, useQueryClient } from '@tanstack/react-query'

import { quoteModel } from '@/models'
import { useAlertStore, useCallbackStore } from '@/stores'

import { removeFromArrayCache, upsertInArrayCache } from './query-cache'

const QUERY_KEY = ['quotes']

export const useQuoteMutation = () => {
  const { alert } = useAlertStore()
  const { handleSuccessCallbacks, handleErrorCallbacks } = useCallbackStore()

  const queryClient = useQueryClient()

  const { mutate: createQuote } = useMutation({
    mutationFn: quoteModel.create,
    onSuccess: (quote) => {
      upsertInArrayCache(queryClient, QUERY_KEY, quote)
      alert({ severity: 'success', title: 'Cotação criada com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao criar cotação' })
      handleErrorCallbacks()
    }
  })

  const { mutate: updateQuote } = useMutation({
    mutationFn: quoteModel.update,
    onSuccess: (quote) => {
      upsertInArrayCache(queryClient, QUERY_KEY, quote)
      alert({ severity: 'success', title: 'Cotação atualizada com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao atualizar cotação' })
      handleErrorCallbacks()
    }
  })

  const { mutate: deleteQuote } = useMutation({
    mutationFn: quoteModel.deleteUniqueById,
    onSuccess: (id) => {
      removeFromArrayCache(queryClient, QUERY_KEY, id)
      alert({ severity: 'success', title: 'Cotação excluída com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao excluir cotação' })
      handleErrorCallbacks()
    }
  })

  return { createQuote, updateQuote, deleteQuote }
}
