import { useMutation, useQueryClient } from '@tanstack/react-query'

import { groupModel } from '@/models'
import { useAlertStore, useCallbackStore } from '@/stores'

export const useGroupMutation = () => {
  const { alert } = useAlertStore()
  const { handleSuccessCallbacks, handleErrorCallbacks } = useCallbackStore()
  const queryClient = useQueryClient()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['groups'] })

  const { mutate: createGroup } = useMutation({
    mutationFn: groupModel.create,
    onSuccess: () => {
      invalidate()
      alert({ severity: 'success', title: 'Grupo criado com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao criar grupo' })
      handleErrorCallbacks()
    }
  })

  const { mutate: updateGroup } = useMutation({
    mutationFn: groupModel.update,
    onSuccess: () => {
      invalidate()
      alert({ severity: 'success', title: 'Grupo atualizado com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao atualizar grupo' })
      handleErrorCallbacks()
    }
  })

  const { mutate: deleteGroup } = useMutation({
    mutationFn: groupModel.deleteUniqueById,
    onSuccess: () => {
      invalidate()
      alert({ severity: 'success', title: 'Grupo excluído com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao excluir grupo' })
      handleErrorCallbacks()
    }
  })

  return { createGroup, updateGroup, deleteGroup }
}
