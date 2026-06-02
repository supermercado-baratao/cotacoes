import z from 'zod'

import { MAX_DESCRIPTION_LENGTH } from '@/constants'
import type { TGroup } from '@/models'
import type { TCreateData } from '@/types'

export const schema = z.object({
  description: z.string().min(1).max(MAX_DESCRIPTION_LENGTH)
}) satisfies z.ZodType<TCreateData<TGroup>>

export type TSchema = z.infer<typeof schema>
