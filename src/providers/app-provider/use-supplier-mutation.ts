import { useMutation, useQueryClient } from '@tanstack/react-query'

import { supplierModel } from '@/models'
import { useAlertStore, useCallbackStore } from '@/stores'

import { removeFromArrayCache, upsertInArrayCache } from './query-cache'

const QUERY_KEY = ['suppliers']

export const useSupplierMutation = () => {
  const { alert } = useAlertStore()
  const { handleSuccessCallbacks, handleErrorCallbacks } = useCallbackStore()

  const queryClient = useQueryClient()

  const { mutate: createSupplier } = useMutation({
    mutationFn: supplierModel.create,
    onSuccess: (supplier) => {
      upsertInArrayCache(queryClient, QUERY_KEY, supplier)
      alert({ severity: 'success', title: 'Fornecedor criado com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao criar fornecedor' })
      handleErrorCallbacks()
    }
  })

  const { mutate: updateSupplier } = useMutation({
    mutationFn: supplierModel.update,
    onSuccess: (supplier) => {
      upsertInArrayCache(queryClient, QUERY_KEY, supplier)
      alert({
        severity: 'success',
        title: 'Fornecedor atualizado com sucesso!'
      })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao atualizar fornecedor' })
      handleErrorCallbacks()
    }
  })

  const { mutate: deleteSupplier } = useMutation({
    mutationFn: supplierModel.deleteUniqueById,
    onSuccess: (id) => {
      removeFromArrayCache(queryClient, QUERY_KEY, id)
      alert({ severity: 'success', title: 'Fornecedor excluído com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao excluir fornecedor' })
      handleErrorCallbacks()
    }
  })

  return { createSupplier, updateSupplier, deleteSupplier }
}
