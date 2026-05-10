import { useMutation, useQueryClient } from '@tanstack/react-query'

import { productModel } from '@/models'
import { useAlertStore, useCallbackStore } from '@/stores'

export const useProductMutation = () => {
  const { alert } = useAlertStore()
  const { handleSuccessCallbacks, handleErrorCallbacks } = useCallbackStore()

  const queryClient = useQueryClient()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['products'] })

  const { mutate: createProduct } = useMutation({
    mutationFn: productModel.create,
    onSuccess: () => {
      invalidate()
      alert({ severity: 'success', title: 'Produto criado com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: (error) => {
      console.error(error)
      alert({ severity: 'error', title: 'Erro ao criar produto' })
      handleErrorCallbacks()
    }
  })

  const { mutate: updateProduct } = useMutation({
    mutationFn: productModel.update,
    onSuccess: () => {
      invalidate()
      alert({ severity: 'success', title: 'Produto atualizado com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: (error) => {
      console.error(error)
      alert({ severity: 'error', title: 'Erro ao atualizar produto' })
      handleErrorCallbacks()
    }
  })

  const { mutate: deleteProduct } = useMutation({
    mutationFn: productModel.deleteUniqueById,
    onSuccess: () => {
      invalidate()
      alert({ severity: 'success', title: 'Produto excluído com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: (error) => {
      console.error(error)
      alert({ severity: 'error', title: 'Erro ao excluir produto' })
      handleErrorCallbacks()
    }
  })

  return { createProduct, updateProduct, deleteProduct }
}
