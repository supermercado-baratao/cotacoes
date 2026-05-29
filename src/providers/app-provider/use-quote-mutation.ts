import { useMutation, useQueryClient } from '@tanstack/react-query'

import { quoteModel } from '@/models'
import { useAlertStore, useCallbackStore } from '@/stores'

export const useQuoteMutation = () => {
  const { alert } = useAlertStore()
  const { handleSuccessCallbacks, handleErrorCallbacks } = useCallbackStore()

  const queryClient = useQueryClient()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['quotes'] })

  const { mutate: createQuote } = useMutation({
    mutationFn: quoteModel.create,
    onSuccess: () => {
      invalidate()
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
    onSuccess: () => {
      invalidate()
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
    onSuccess: () => {
      invalidate()
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
