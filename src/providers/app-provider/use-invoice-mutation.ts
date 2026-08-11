import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Timestamp } from 'firebase/firestore'

import { ConflictError } from '@/infra'
import { invoiceModel, settingsModel, type TInvoice } from '@/models'
import { useAlertStore, useAppStore, useCallbackStore } from '@/stores'

import {
  addInvoicesToCache,
  removeInvoiceFromCache,
  upsertInvoiceInCache
} from './invoice-cache'

export const useInvoiceMutation = () => {
  const { alert } = useAlertStore()
  const { handleSuccessCallbacks, handleErrorCallbacks } = useCallbackStore()
  const invoiceDateRange = useAppStore((state) => state.invoiceDateRange)

  const queryClient = useQueryClient()

  const { mutate: createInvoice } = useMutation({
    mutationFn: invoiceModel.create,
    onSuccess: (invoice) => {
      upsertInvoiceInCache(queryClient, invoice, invoiceDateRange)
      alert({ severity: 'success', title: 'Nota importada com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: (error: Error) => {
      const isDuplicate = error instanceof ConflictError
      alert({
        severity: 'error',
        title: isDuplicate
          ? 'Nota já importada anteriormente'
          : 'Erro ao importar nota'
      })
      handleErrorCallbacks()
    }
  })

  const { mutate: createInvoicesBatch } = useMutation({
    mutationFn: (data: Array<Omit<TInvoice, 'createdAt' | 'updatedAt'>>) =>
      invoiceModel.createMany(data),
    onSuccess: (invoices) => {
      addInvoicesToCache(queryClient, invoices, invoiceDateRange)
      const n = invoices.length
      alert({
        severity: 'success',
        title: `${n} ${n === 1 ? 'nota importada' : 'notas importadas'} com sucesso!`
      })
      handleSuccessCallbacks()
      settingsModel
        .upsert({ lastInvoiceImportAt: Timestamp.now() })
        .then((settings) => queryClient.setQueryData(['settings'], settings))
        .catch(() => {})
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao importar notas' })
      handleErrorCallbacks()
    }
  })

  const { mutate: updateInvoice } = useMutation({
    mutationFn: invoiceModel.update,
    onSuccess: (invoice) => {
      upsertInvoiceInCache(queryClient, invoice, invoiceDateRange)
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
    onSuccess: (id) => {
      removeInvoiceFromCache(queryClient, id, invoiceDateRange)
      alert({ severity: 'success', title: 'Nota excluída com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao excluir nota' })
      handleErrorCallbacks()
    }
  })

  return { createInvoice, createInvoicesBatch, updateInvoice, deleteInvoice }
}
