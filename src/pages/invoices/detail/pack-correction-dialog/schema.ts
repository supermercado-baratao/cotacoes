import { z } from 'zod'

import { MAX_NUMERIC_VALUE } from '@/constants/length'

export const MIN_PACKING_QUANTITY = 1

export const schema = z.object({
  packingQuantity: z
    .number({ error: 'Informe a quantidade' })
    .int('Deve ser número inteiro')
    .min(MIN_PACKING_QUANTITY, `Deve ser no mínimo ${MIN_PACKING_QUANTITY}`)
    .max(MAX_NUMERIC_VALUE)
})

export type TSchema = z.infer<typeof schema>
