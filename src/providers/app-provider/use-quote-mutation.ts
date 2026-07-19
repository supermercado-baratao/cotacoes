import { quoteModel } from '@/models'

import { useEntityMutation } from './use-entity-mutation'

export const useQuoteMutation = () => {
  const {
    createItem: createQuote,
    updateItem: updateQuote,
    deleteItem: deleteQuote
  } = useEntityMutation({
    queryKey: ['quotes'],
    create: quoteModel.create,
    update: quoteModel.update,
    deleteUniqueById: quoteModel.deleteUniqueById,
    labels: {
      created: 'Cotação criada com sucesso!',
      createError: 'Erro ao criar cotação',
      updated: 'Cotação atualizada com sucesso!',
      updateError: 'Erro ao atualizar cotação',
      deleted: 'Cotação excluída com sucesso!',
      deleteError: 'Erro ao excluir cotação'
    }
  })

  return { createQuote, updateQuote, deleteQuote }
}
