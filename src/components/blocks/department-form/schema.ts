import z from 'zod'

import { MAX_DESCRIPTION_LENGTH } from '@/constants/length'
import type { TDepartment } from '@/models/department/types'
import type { TCreateData } from '@/types/generics'

export const schema = z.object({
  description: z.string().min(1).max(MAX_DESCRIPTION_LENGTH)
}) satisfies z.ZodType<TCreateData<TDepartment>>

export type TSchema = z.infer<typeof schema>
