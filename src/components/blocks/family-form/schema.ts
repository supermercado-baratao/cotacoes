import z from 'zod'

import { MAX_DESCRIPTION_LENGTH } from '@/constants'
import type { TFamily } from '@/models'
import type { TCreateData } from '@/types'

export const schema = z.object({
  vrId: z.string().min(1),
  description: z.string().min(1).max(MAX_DESCRIPTION_LENGTH)
}) satisfies z.ZodType<TCreateData<TFamily>>

export type TSchema = z.infer<typeof schema>
