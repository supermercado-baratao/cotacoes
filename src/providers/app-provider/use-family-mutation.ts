import { useMutation, useQueryClient } from '@tanstack/react-query'

import { familyModel } from '@/models'
import { useAlertStore, useCallbackStore } from '@/stores'

export const useFamilyMutation = () => {
  const { alert } = useAlertStore()
  const { handleSuccessCallbacks, handleErrorCallbacks } = useCallbackStore()

  const queryClient = useQueryClient()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['families'] })

  const { mutate: createFamily } = useMutation({
    mutationFn: familyModel.create,
    onSuccess: () => {
      invalidate()
      alert({ severity: 'success', title: 'Família criada com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao criar família' })
      handleErrorCallbacks()
    }
  })

  const { mutate: updateFamily } = useMutation({
    mutationFn: familyModel.update,
    onSuccess: () => {
      invalidate()
      alert({ severity: 'success', title: 'Família atualizada com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao atualizar família' })
      handleErrorCallbacks()
    }
  })

  const { mutate: deleteFamily } = useMutation({
    mutationFn: familyModel.deleteUniqueById,
    onSuccess: () => {
      invalidate()
      alert({ severity: 'success', title: 'Família excluída com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao excluir família' })
      handleErrorCallbacks()
    }
  })

  return { createFamily, updateFamily, deleteFamily }
}
