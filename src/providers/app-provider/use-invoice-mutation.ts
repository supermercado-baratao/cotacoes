import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invoiceModel } from '@/models'
import { useAlertStore, useCallbackStore } from '@/stores'

export const useInvoiceMutation = () => {
  const { alert } = useAlertStore()
  const { handleSuccessCallbacks, handleErrorCallbacks } = useCallbackStore()

  const queryClient = useQueryClient()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['invoices'] })

  const { mutate: createInvoice } = useMutation({
    mutationFn: invoiceModel.create,
    onSuccess: () => {
      invalidate()
      alert({ severity: 'success', title: 'Nota importada com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: (error: Error) => {
      const isDuplicate =
        error.message === 'Nota fiscal já importada anteriormente'
      alert({
        severity: 'error',
        title: isDuplicate
          ? 'Nota já importada anteriormente'
          : 'Erro ao importar nota'
      })
      handleErrorCallbacks()
    }
  })

  const { mutate: updateInvoice } = useMutation({
    mutationFn: invoiceModel.update,
    onSuccess: () => {
      invalidate()
      alert({ severity: 'success', title: 'Nota atualizada com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao atualizar nota' })
      handleErrorCallbacks()
    }
  })

  const { mutate: deleteInvoice } = useMutation({
    mutationFn: invoiceModel.deleteUniqueById,
    onSuccess: () => {
      invalidate()
      alert({ severity: 'success', title: 'Nota excluída com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao excluir nota' })
      handleErrorCallbacks()
    }
  })

  return { createInvoice, updateInvoice, deleteInvoice }
}
