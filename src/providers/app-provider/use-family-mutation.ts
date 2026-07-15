import { useMutation, useQueryClient } from '@tanstack/react-query'

import { familyModel } from '@/models'
import { useAlertStore, useCallbackStore } from '@/stores'

import { removeFromArrayCache, upsertInArrayCache } from './query-cache'

const QUERY_KEY = ['families']

export const useFamilyMutation = () => {
  const { alert } = useAlertStore()
  const { handleSuccessCallbacks, handleErrorCallbacks } = useCallbackStore()

  const queryClient = useQueryClient()

  const { mutate: createFamily } = useMutation({
    mutationFn: familyModel.create,
    onSuccess: (family) => {
      upsertInArrayCache(queryClient, QUERY_KEY, family)
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
    onSuccess: (family) => {
      upsertInArrayCache(queryClient, QUERY_KEY, family)
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
    onSuccess: (id) => {
      removeFromArrayCache(queryClient, QUERY_KEY, id)
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
