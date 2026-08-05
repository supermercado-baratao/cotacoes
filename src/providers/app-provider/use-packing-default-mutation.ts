import { useMutation, useQueryClient } from '@tanstack/react-query'

import { packingDefaultModel, type TPackingDefault } from '@/models'
import { findPackingDefault } from '@/utils'

import { upsertInArrayCache } from './query-cache'

const QUERY_KEY = ['packing-defaults']

type TPayload = {
  supplierId: string
  productId: string
  packing: string
  packingQuantity: number
}

export const usePackingDefaultMutation = () => {
  const queryClient = useQueryClient()

  const { mutate: upsertPackingDefault } = useMutation({
    mutationFn: (payload: TPayload) => {
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
    },
    onSuccess: (packingDefault) => {
      upsertInArrayCache(queryClient, QUERY_KEY, packingDefault)
    }
  })

  return { upsertPackingDefault }
}
