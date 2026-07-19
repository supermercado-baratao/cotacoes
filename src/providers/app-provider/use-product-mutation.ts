import { productModel } from '@/models'

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

  return { createProduct, updateProduct, deleteProduct }
}
