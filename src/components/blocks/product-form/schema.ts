import z from 'zod'

import {
  MAX_DESCRIPTION_LENGTH,
  MAX_NUMERIC_VALUE,
  MAX_OBSERVATIONS_LENGTH
} from '@/constants'
import { type TProduct } from '@/models'
import type { TCreateData } from '@/types'

export const MAX_BARCODE_LENGTH = 14

export const schema = z.object({
  vrId: z.string().min(1),
  description: z.string().min(1).max(MAX_DESCRIPTION_LENGTH),
  price: z.number().nonnegative().max(MAX_NUMERIC_VALUE),
  barcode: z.string().max(MAX_BARCODE_LENGTH).nullable(),
  tax: z.number().min(0).max(MAX_NUMERIC_VALUE).nullable(),
  margin: z.number().min(0).max(MAX_NUMERIC_VALUE).nullable(),
  observations: z.string().max(MAX_OBSERVATIONS_LENGTH).nullable(),
  familyId: z.string().nullable(),
  supplierIds: z.array(z.string())
}) satisfies z.ZodType<TCreateData<TProduct>>

export type TSchema = z.infer<typeof schema>
