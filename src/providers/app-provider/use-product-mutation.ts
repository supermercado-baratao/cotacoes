import { useMutation, useQueryClient } from '@tanstack/react-query'

import { productModel } from '@/models'
import { useAlertStore, useCallbackStore } from '@/stores'

import { removeFromArrayCache, upsertInArrayCache } from './query-cache'

const QUERY_KEY = ['products']

export const useProductMutation = () => {
  const { alert } = useAlertStore()
  const { handleSuccessCallbacks, handleErrorCallbacks } = useCallbackStore()

  const queryClient = useQueryClient()

  const { mutate: createProduct } = useMutation({
    mutationFn: productModel.create,
    onSuccess: (product) => {
      upsertInArrayCache(queryClient, QUERY_KEY, product)
      alert({ severity: 'success', title: 'Produto criado com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao criar produto' })
      handleErrorCallbacks()
    }
  })

  const { mutate: updateProduct } = useMutation({
    mutationFn: productModel.update,
    onSuccess: (product) => {
      upsertInArrayCache(queryClient, QUERY_KEY, product)
      alert({ severity: 'success', title: 'Produto atualizado com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao atualizar produto' })
      handleErrorCallbacks()
    }
  })

  const { mutate: deleteProduct } = useMutation({
    mutationFn: productModel.deleteUniqueById,
    onSuccess: (id) => {
      removeFromArrayCache(queryClient, QUERY_KEY, id)
      alert({ severity: 'success', title: 'Produto excluído com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao excluir produto' })
      handleErrorCallbacks()
    }
  })

  return { createProduct, updateProduct, deleteProduct }
}
