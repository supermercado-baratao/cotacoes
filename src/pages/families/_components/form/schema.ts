import z from 'zod'

import type { TFamily } from '@/models'
import type { TCreateData } from '@/types'

export const MAX_DESCRIPTION_LENGTH = 100

export const schema = z.object({
  description: z.string().min(1).max(MAX_DESCRIPTION_LENGTH),
  productIds: z.array(z.string())
}) satisfies z.ZodType<TCreateData<TFamily>>

export type TSchema = z.infer<typeof schema>
