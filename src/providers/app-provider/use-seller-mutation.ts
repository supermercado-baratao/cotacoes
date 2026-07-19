import { sellerModel } from '@/models'

import { useEntityMutation } from './use-entity-mutation'

export const useSellerMutation = () => {
  const {
    createItem: createSeller,
    updateItem: updateSeller,
    deleteItem: deleteSeller
  } = useEntityMutation({
    queryKey: ['sellers'],
    create: sellerModel.create,
    update: sellerModel.update,
    deleteUniqueById: sellerModel.deleteUniqueById,
    labels: {
      created: 'Vendedor criado com sucesso!',
      createError: 'Erro ao criar vendedor',
      updated: 'Vendedor atualizado com sucesso!',
      updateError: 'Erro ao atualizar vendedor',
      deleted: 'Vendedor excluído com sucesso!',
      deleteError: 'Erro ao excluir vendedor'
    }
  })

  return { createSeller, updateSeller, deleteSeller }
}
