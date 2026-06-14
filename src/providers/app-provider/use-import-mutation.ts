import { useMutation, useQueryClient } from '@tanstack/react-query'

import { importModel } from '@/models'
import { useAlertStore, useCallbackStore } from '@/stores'

export const useImportMutation = () => {
  const { alert } = useAlertStore()
  const { handleSuccessCallbacks, handleErrorCallbacks } = useCallbackStore()

  const queryClient = useQueryClient()

  const { mutate: importData } = useMutation({
    mutationFn: importModel.import,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['families'] })
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      alert({ severity: 'success', title: 'Dados importados com sucesso!' })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao importar dados' })
      handleErrorCallbacks()
    }
  })

  return { importData }
}
