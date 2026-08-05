import { useMutation, useQueryClient } from '@tanstack/react-query'

import { packageBarcodeLinkModel } from '@/models'
import { useAlertStore, useCallbackStore } from '@/stores'

import { upsertInArrayCache } from './query-cache'

const QUERY_KEY = ['package-barcode-links']

export const usePackageBarcodeLinkMutation = () => {
  const { alert } = useAlertStore()
  const { handleSuccessCallbacks, handleErrorCallbacks } = useCallbackStore()
  const queryClient = useQueryClient()

  const { mutate: createPackageBarcodeLink } = useMutation({
    mutationFn: packageBarcodeLinkModel.create,
    onSuccess: (link) => {
      upsertInArrayCache(queryClient, QUERY_KEY, link)
      alert({ severity: 'success', title: 'Produto associado com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao associar produto' })
      handleErrorCallbacks()
    }
  })

  return { createPackageBarcodeLink }
}
