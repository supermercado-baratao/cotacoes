import IMask from 'imask'

const currencyMaskOpts = {
  mask: Number,
  scale: 2,
  thousandsSeparator: '.',
  radix: ',',
  mapToRadix: ['.'],
  normalizeZeros: true,
  padFractionalZeros: true
}

const currencyInputPipe = IMask.createPipe(
  currencyMaskOpts,
  IMask.PIPE_TYPE.TYPED,
  IMask.PIPE_TYPE.MASKED
)

const currencyParsePipe = IMask.createPipe(
  currencyMaskOpts,
  IMask.PIPE_TYPE.MASKED,
  IMask.PIPE_TYPE.TYPED
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

export const formatPhone = (phone: string): string => {
  if (!phone) return ''
  return phonePipe(phone)
}

export const formatCurrency = (value: number): string =>
  `R$ ${currencyInputPipe(value ?? 0)}`

export const parseCurrencyInput = (value: string): number =>
  (currencyParsePipe(value) as number) ?? 0

export const formatCurrencyInput = (value: number): string =>
  currencyInputPipe(value ?? 0)
