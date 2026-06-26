import { z } from 'zod'

export const schema = z.object({
  familyId: z.string().nullable(),
  productId: z.string().nullable(),
  salePrice: z.number().positive().nullable()
})

export type TSchema = z.infer<typeof schema>
