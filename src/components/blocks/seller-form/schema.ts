import z from 'zod'

import { PHONE_MAX_LENGTH, PHONE_MIN_LENGTH } from '@/constants'
import type { TSeller } from '@/models'
import type { TCreateData } from '@/types'

export const MAX_NAME_LENGTH = 100

export const schema = z.object({
  name: z.string().min(1).max(MAX_NAME_LENGTH),
  phone: z
    .string()
    .min(PHONE_MIN_LENGTH, 'Telefone inválido')
    .max(PHONE_MAX_LENGTH, 'Telefone inválido')
    .nullable(),
  supplierIds: z.array(z.string()).min(1, 'Selecione ao menos um fornecedor')
}) satisfies z.ZodType<TCreateData<TSeller>>

export type TSchema = z.infer<typeof schema>
