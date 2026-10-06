import z from 'zod'

import { MAX_OBSERVATIONS_LENGTH } from '@/constants/length'

export const schema = z.object({
  date: z.string().min(1),
  lines: z.string().min(1),
  observations: z.string().max(MAX_OBSERVATIONS_LENGTH).nullable(),
  status: z.enum(['opened', 'closed']),
  orders: z.array(z.string())
})

export type TSchema = z.infer<typeof schema>
