import z from 'zod'

import { MAX_OBSERVATIONS_LENGTH } from '@/constants'
import type { TQuote } from '@/models'
import type { TCreateData } from '@/types'

export const schema = z.object({
  date: z.string().min(1),
  items: z.array(
    z.object({ id: z.string(), type: z.enum(['product', 'family']) })
  ),
  observations: z.string().max(MAX_OBSERVATIONS_LENGTH).nullable(),
  status: z.enum(['opened', 'closed']),
  orders: z.array(z.string())
}) satisfies z.ZodType<TCreateData<TQuote>>

export type TSchema = z.infer<typeof schema>
