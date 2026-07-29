import { useMutation, useQueryClient } from '@tanstack/react-query'

import { productModel, type TProduct } from '@/models'
import { useAlertStore, useCallbackStore } from '@/stores'
import type { TUpdateData } from '@/types'

import { useEntityMutation } from './use-entity-mutation'

export const useProductMutation = () => {
  const {
    createItem: createProduct,
    updateItem: updateProduct,
    deleteItem: deleteProduct
  } = useEntityMutation({
    queryKey: ['products'],
    create: productModel.create,
    update: productModel.update,
    deleteUniqueById: productModel.deleteUniqueById,
    labels: {
      created: 'Produto criado com sucesso!',
      createError: 'Erro ao criar produto',
      updated: 'Produto atualizado com sucesso!',
      updateError: 'Erro ao atualizar produto',
      deleted: 'Produto excluído com sucesso!',
      deleteError: 'Erro ao excluir produto'
    }
  })

  const { alert } = useAlertStore()
  const { handleSuccessCallbacks, handleErrorCallbacks } = useCallbackStore()
  const queryClient = useQueryClient()

  const { mutate: updateProductsBatch } = useMutation({
    mutationFn: (products: TUpdateData<TProduct[]>) =>
      productModel.updateMany(products),
    onSuccess: (products) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      const n = products.length
      alert({
        severity: 'success',
        title: `${n} ${n === 1 ? 'produto atualizado' : 'produtos atualizados'} com sucesso!`
      })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao atualizar produtos' })
      handleErrorCallbacks()
    }
  })

  return { createProduct, updateProduct, deleteProduct, updateProductsBatch }
}
