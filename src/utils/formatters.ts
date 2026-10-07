import IMask from 'imask'

import { CNPJ_LENGTH } from '@/constants/length'

const numericMaskOptions = {
  mask: Number,
  scale: 2,
  thousandsSeparator: '.',
  radix: ',',
  mapToRadix: ['.'],
  normalizeZeros: true,
  padFractionalZeros: true
}

const numericInputPipe = IMask.createPipe(
  numericMaskOptions,
  IMask.PIPE_TYPE.TYPED,
  IMask.PIPE_TYPE.MASKED
)

const cnpjPipe = IMask.createPipe(
  { mask: '00.000.000/0000-00' },
  IMask.PIPE_TYPE.UNMASKED,
  IMask.PIPE_TYPE.MASKED
)

const phonePipe = IMask.createPipe(
  { mask: [{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }] },
  IMask.PIPE_TYPE.UNMASKED,
  IMask.PIPE_TYPE.MASKED
)

export const formatCNPJ = (cnpj: string): string => cnpjPipe(cnpj)

export const normalizeCnpj = (cnpj: string): string =>
  cnpj.replaceAll(/\D/g, '').padStart(CNPJ_LENGTH, '0')

export const formatPhone = (phone: string): string =>
  phone ? phonePipe(phone) : ''

export const formatCurrency = (value: number): string =>
  `R$ ${numericInputPipe(value)}`

export const formatNumericValue = (value: number): string => {
  const formatted = numericInputPipe(value)
  return formatted.endsWith(',00') ? formatted.slice(0, -3) : formatted
}
