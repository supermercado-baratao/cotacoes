import { useMutation, useQueryClient } from '@tanstack/react-query'

import { priceAdjustmentModel } from '@/models/price-adjustment-model/model'
import { type TPriceAdjustment } from '@/models/price-adjustment-model/types'
import { useAlertStore } from '@/stores/use-alert-store'
import { useCallbackStore } from '@/stores/use-callback-store'
import type { TCreateDataWithId } from '@/types/generics'

export const usePriceAdjustmentMutation = () => {
  const { alert } = useAlertStore()
  const { handleSuccessCallbacks, handleErrorCallbacks } = useCallbackStore()
  const queryClient = useQueryClient()

  const { mutate: replacePriceAdjustments } = useMutation({
    mutationFn: (data: TCreateDataWithId<TPriceAdjustment[]>) =>
      priceAdjustmentModel.replaceAll(data),
    onSuccess: (priceAdjustments) => {
      queryClient.invalidateQueries({ queryKey: ['price-adjustments'] })
      const n = priceAdjustments.length
      alert({
        severity: 'success',
        title: `Reajustes importados com sucesso! ${n} ${n === 1 ? 'produto' : 'produtos'}.`
      })
      handleSuccessCallbacks()
    },
    onError: () => {
      alert({ severity: 'error', title: 'Erro ao importar reajustes' })
      handleErrorCallbacks()
    }
  })

  return { replacePriceAdjustments }
}
