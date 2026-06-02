import type { TQuoteRow } from '@/pages/quotes/utils'

export const TYPE_LABELS: Record<TQuoteRow['type'], string> = {
  product: 'Produto',
  family: 'Família',
  group: 'Grupo'
}

export const TYPE_COLORS: Record<
  TQuoteRow['type'],
  'default' | 'primary' | 'secondary'
> = {
  product: 'default',
  family: 'primary',
  group: 'secondary'
}
