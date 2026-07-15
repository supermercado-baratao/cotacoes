import { useMutation, useQueryClient } from '@tanstack/react-query'

import { settingsModel } from '@/models'
import { useAlertStore, useCallbackStore } from '@/stores'

const QUERY_KEY = ['settings']

export const useSettingsMutation = () => {
  const { alert } = useAlertStore()
  const { handleSuccessCallbacks, handleErrorCallbacks } = useCallbackStore()

  const queryClient = useQueryClient()

  const { mutate: updateSettings } = useMutation({
    mutationFn: settingsModel.upsert,
    onSuccess: (settings) => {
      queryClient.setQueryData(QUERY_KEY, settings)
      alert({ severity: 'success', title: 'Configurações salvas com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao salvar configurações' })
      handleErrorCallbacks()
    }
  })

  return { updateSettings }
}
