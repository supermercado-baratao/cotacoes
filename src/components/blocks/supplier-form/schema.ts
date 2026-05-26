import { isCNPJ } from 'validation-br'
import z from 'zod'

import { PHONE_MAX_LENGTH, PHONE_MIN_LENGTH } from '@/constants'
import type { TSupplier } from '@/models'
import type { TCreateData } from '@/types'

export const MAX_LEGAL_NAME_LENGTH = 200
export const MAX_TRADE_NAME_LENGTH = 200

export const schema = z.object({
  legalName: z.string().min(1).max(MAX_LEGAL_NAME_LENGTH),
  tradeName: z.string().min(1).max(MAX_TRADE_NAME_LENGTH),
  cnpj: z.string().refine(isCNPJ, 'CNPJ inválido'),
  email: z.email().nullable(),
  phone: z
    .string()
    .min(PHONE_MIN_LENGTH, 'Telefone inválido')
    .max(PHONE_MAX_LENGTH, 'Telefone inválido')
    .nullable(),
  sellerIds: z.array(z.string())
}) satisfies z.ZodType<TCreateData<TSupplier>>

export type TSchema = z.infer<typeof schema>
