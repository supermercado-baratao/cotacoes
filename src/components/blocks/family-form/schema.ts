import z from 'zod'

import { MAX_DESCRIPTION_LENGTH } from '@/constants/length'
import type { TFamily } from '@/models/family-model/types'
import type { TCreateDataWithId } from '@/types/generics'

export const schema = z.object({
  id: z.string().min(1),
  description: z.string().min(1).max(MAX_DESCRIPTION_LENGTH)
}) satisfies z.ZodType<TCreateDataWithId<TFamily>>

export type TSchema = z.infer<typeof schema>
