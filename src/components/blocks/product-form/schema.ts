import z from 'zod'

import {
  MAX_DESCRIPTION_LENGTH,
  MAX_NUMERIC_VALUE,
  MAX_OBSERVATIONS_LENGTH
} from '@/constants/length'

const packagingSchema = z.object({
  barcode: z.string(),
  packType: z.string()
})

export const schema = z.object({
  id: z.string().min(1),
  description: z.string().min(1).max(MAX_DESCRIPTION_LENGTH),
  price: z.number().nonnegative().max(MAX_NUMERIC_VALUE),
  // CurrencyInput emite `undefined` quando o campo é limpo
  costWithTax: z.number().nonnegative().max(MAX_NUMERIC_VALUE).nullish(),
  tax: z.number().min(0).max(MAX_NUMERIC_VALUE).nullable(),
  margin: z.number().min(0).max(MAX_NUMERIC_VALUE).nullable(),
  stock: z.number(),
  packagings: z.array(packagingSchema),
  department: z.string().max(MAX_DESCRIPTION_LENGTH),
  section: z.string().max(MAX_DESCRIPTION_LENGTH),
  group: z.string().max(MAX_DESCRIPTION_LENGTH),
  observations: z.string().max(MAX_OBSERVATIONS_LENGTH).nullable(),
  familyId: z.string().nullable(),
  departmentId: z.string().nullable()
})

export type TSchema = z.infer<typeof schema>
