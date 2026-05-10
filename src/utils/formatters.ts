export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value ?? 0)
}

export const parseCurrencyInput = (value: string): number => {
  const digits = value.replace(/\D/g, '')
  if (!digits) return 0
  return parseInt(digits, 10) / 100
}

export const formatCurrencyInput = (value: number): string => {
  const cents = Math.round((value ?? 0) * 100)
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
