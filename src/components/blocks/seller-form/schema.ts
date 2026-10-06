import z from 'zod'

import {
  MAX_DESCRIPTION_LENGTH,
  PHONE_MAX_LENGTH,
  PHONE_MIN_LENGTH
} from '@/constants/length'
import type { TSeller } from '@/models/seller-model/types'
import type { TCreateData } from '@/types/generics'

export const schema = z.object({
  name: z.string().min(1).max(MAX_DESCRIPTION_LENGTH),
  phone: z
    .string()
    .min(PHONE_MIN_LENGTH, 'Telefone inválido')
    .max(PHONE_MAX_LENGTH, 'Telefone inválido')
    .nullable(),
  supplierIds: z.array(z.string()).min(1, 'Selecione ao menos um fornecedor')
}) satisfies z.ZodType<TCreateData<TSeller>>

export type TSchema = z.infer<typeof schema>
