import { supplierModel } from '@/models'

import { useEntityMutation } from './use-entity-mutation'

export const useSupplierMutation = () => {
  const {
    createItem: createSupplier,
    updateItem: updateSupplier,
    deleteItem: deleteSupplier
  } = useEntityMutation({
    queryKey: ['suppliers'],
    create: supplierModel.create,
    update: supplierModel.update,
    deleteUniqueById: supplierModel.deleteUniqueById,
    labels: {
      created: 'Fornecedor criado com sucesso!',
      createError: 'Erro ao criar fornecedor',
      updated: 'Fornecedor atualizado com sucesso!',
      updateError: 'Erro ao atualizar fornecedor',
      deleted: 'Fornecedor excluído com sucesso!',
      deleteError: 'Erro ao excluir fornecedor'
    }
  })

  return { createSupplier, updateSupplier, deleteSupplier }
}
