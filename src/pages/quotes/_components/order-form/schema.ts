import z from 'zod'

import {
  MAX_DESCRIPTION_LENGTH,
  MAX_NUMERIC_VALUE,
  MAX_OBSERVATIONS_LENGTH
} from '@/constants'
import type { TOrder } from '@/models'
import type { TCreateData } from '@/types'

export const createSchema = (minDate: string) =>
  z.object({
    supplierId: z.string().min(1, 'Selecione um fornecedor'),
    sellerId: z.string().nullable(),
    date: z
      .string()
      .min(1, 'Informe a data')
      .refine(
        (d) => d >= minDate,
        'Data não pode ser anterior à data da cotação'
      ),
    price: z.number().positive('Deve ser positivo').max(MAX_NUMERIC_VALUE),
    quantity: z
      .number()
      .int('Deve ser número inteiro')
      .positive('Deve ser positivo')
      .max(MAX_NUMERIC_VALUE),
    packing: z
      .string()
      .min(1, 'Informe a embalagem')
      .max(MAX_DESCRIPTION_LENGTH),
    observations: z.string().max(MAX_OBSERVATIONS_LENGTH).nullable()
  }) satisfies z.ZodType<Omit<TCreateData<TOrder>, 'quoteId' | 'productId'>>

export type TSchema = z.infer<ReturnType<typeof createSchema>>
