import { familyModel } from '@/models/family-model/model'

import { useEntityMutation } from './use-entity-mutation'

export const useFamilyMutation = () => {
  const {
    createItem: createFamily,
    updateItem: updateFamily,
    deleteItem: deleteFamily
  } = useEntityMutation({
    queryKey: ['families'],
    create: familyModel.create,
    update: familyModel.update,
    deleteUniqueById: familyModel.deleteUniqueById,
    labels: {
      created: 'Família criada com sucesso!',
      createError: 'Erro ao criar família',
      updated: 'Família atualizada com sucesso!',
      updateError: 'Erro ao atualizar família',
      deleted: 'Família excluída com sucesso!',
      deleteError: 'Erro ao excluir família'
    }
  })

  return { createFamily, updateFamily, deleteFamily }
}
