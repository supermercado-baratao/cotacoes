import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Timestamp } from 'firebase/firestore'

import { ConflictError } from '@/infra/errors'
import { invoiceModel } from '@/models/invoice/model'
import { type TInvoice } from '@/models/invoice/types'
import { settingsModel } from '@/models/settings/model'
import { useAlertStore } from '@/stores/use-alert-store'
import { useAppStore } from '@/stores/use-app-store'
import { useCallbackStore } from '@/stores/use-callback-store'

import {
  addInvoicesToCache,
  removeInvoiceFromCache,
  upsertInvoiceInCache
} from './invoice-cache'

const buildImportSuccessTitle = (
  createdCount: number,
  completedCount: number
): string => {
  const parts: string[] = []
  if (createdCount || !completedCount) {
    parts.push(
      `${createdCount} ${createdCount === 1 ? 'nota importada' : 'notas importadas'}`
    )
  }
  if (completedCount) {
    parts.push(
      `${completedCount} ${completedCount === 1 ? 'nota completada' : 'notas completadas'}`
    )
  }
  return `${parts.join(' e ')} com sucesso!`
}

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
    onSuccess: ({ created, completed }) => {
      addInvoicesToCache(queryClient, created, invoiceDateRange)
      for (const invoice of completed) {
        upsertInvoiceInCache(queryClient, invoice, invoiceDateRange)
      }
      alert({
        severity: 'success',
        title: buildImportSuccessTitle(created.length, completed.length)
      })
      handleSuccessCallbacks()
      if (created.length === 0) return
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
