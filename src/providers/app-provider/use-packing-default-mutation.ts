import { useMutation, useQueryClient } from '@tanstack/react-query'

import { packingDefaultModel } from '@/models/packing-default-model/model'
import { type TPackingDefault } from '@/models/packing-default-model/types'
import { useAlertStore } from '@/stores/use-alert-store'
import { useCallbackStore } from '@/stores/use-callback-store'
import { findPackingDefault } from '@/utils/packing-defaults'

import { removeFromArrayCache, upsertInArrayCache } from './query-cache'

const QUERY_KEY = ['packing-defaults']

type TPayload = {
  supplierId: string
  productId: string
  packing: string
  packingQuantity: number
}

export const usePackingDefaultMutation = () => {
  const { alert } = useAlertStore()
  const { handleSuccessCallbacks, handleErrorCallbacks } = useCallbackStore()
  const queryClient = useQueryClient()

  const upsert = (payload: TPayload) => {
    const existing = findPackingDefault(
      queryClient.getQueryData<TPackingDefault[]>(QUERY_KEY) ?? [],
      payload
    )
    if (existing) {
      if (existing.packingQuantity === payload.packingQuantity) {
        return Promise.resolve(existing)
      }
      return packingDefaultModel.update({
        ...existing,
        packingQuantity: payload.packingQuantity
      })
    }
    return packingDefaultModel.create(payload)
  }

  // No callbacks: order checking saves the packing alongside the order
  // mutation, which is the one that consumes the registered callbacks.
  const { mutate: upsertPackingDefault } = useMutation({
    mutationFn: upsert,
    onSuccess: (packingDefault) => {
      upsertInArrayCache(queryClient, QUERY_KEY, packingDefault)
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao salvar a Qtd. Embalagem' })
    }
  })

  const { mutate: savePackingCorrection } = useMutation({
    mutationFn: upsert,
    onSuccess: (packingDefault) => {
      upsertInArrayCache(queryClient, QUERY_KEY, packingDefault)
      alert({ severity: 'success', title: 'Qtd. Embalagem corrigida!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao salvar a Qtd. Embalagem' })
      handleErrorCallbacks()
    }
  })

  const { mutate: deletePackingDefault } = useMutation({
    mutationFn: packingDefaultModel.deleteUniqueById,
    onSuccess: (id) => {
      removeFromArrayCache(queryClient, QUERY_KEY, id)
      alert({
        severity: 'success',
        title: 'Correção da Qtd. Embalagem removida!'
      })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao remover a Qtd. Embalagem' })
      handleErrorCallbacks()
    }
  })

  return { upsertPackingDefault, savePackingCorrection, deletePackingDefault }
}
