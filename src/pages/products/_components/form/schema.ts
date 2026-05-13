import dayjs from 'dayjs'
import z from 'zod'

import { type TProduct } from '@/models'
import type { TCreateData } from '@/types'

export const MAX_NUMERIC_VALUE = 999999999999999
export const MAX_BARCODE_LENGTH = 14
export const MAX_DESCRIPTION_LENGTH = 100
export const MAX_PACKAGING_LENGTH = 10
export const MAX_OBSERVATION_LENGTH = 500

export const schema = z.object({
  description: z.string().min(1).max(MAX_DESCRIPTION_LENGTH),
  price: z.number().nonnegative().max(MAX_NUMERIC_VALUE),
  purchasePrice: z.number().nonnegative().max(MAX_NUMERIC_VALUE),
  quantity: z.number().nonnegative().max(MAX_NUMERIC_VALUE),
  packaging: z.string().max(MAX_PACKAGING_LENGTH).nullable(),
  supplierIds: z.array(z.string()),
  barcode: z.string().max(MAX_BARCODE_LENGTH).nullable(),
  tax: z.number().min(0).max(MAX_NUMERIC_VALUE).nullable(),
  margin: z.number().min(0).max(MAX_NUMERIC_VALUE).nullable(),
  observation: z.string().max(MAX_OBSERVATION_LENGTH).nullable(),
  expirationDate: z
    .string()
    .refine((date) => {
      if (date === '') return true
      return dayjs(date).isValid()
    })
    .nullable(),
  familyId: z.string().nullable()
}) satisfies z.ZodType<TCreateData<TProduct>>

export type TSchema = z.infer<typeof schema>
