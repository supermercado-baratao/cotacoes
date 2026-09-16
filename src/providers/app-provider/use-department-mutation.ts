import { departmentModel } from '@/models'

import { useEntityMutation } from './use-entity-mutation'

export const useDepartmentMutation = () => {
  const {
    createItem: createDepartment,
    updateItem: updateDepartment,
    deleteItem: deleteDepartment
  } = useEntityMutation({
    queryKey: ['departments'],
    create: departmentModel.create,
    update: departmentModel.update,
    deleteUniqueById: departmentModel.deleteUniqueById,
    labels: {
      created: 'Departamento criado com sucesso!',
      createError: 'Erro ao criar departamento',
      updated: 'Departamento atualizado com sucesso!',
      updateError: 'Erro ao atualizar departamento',
      deleted: 'Departamento excluído com sucesso!',
      deleteError: 'Erro ao excluir departamento'
    }
  })

  return { createDepartment, updateDepartment, deleteDepartment }
}
