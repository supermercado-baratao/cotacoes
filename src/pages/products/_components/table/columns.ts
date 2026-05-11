import type { GridColDef } from '@mui/x-data-grid'

import type { TProduct } from '@/models'
import { formatCurrency } from '@/utils'

import { calcSuggestedPrice } from '../../utils'

export const columns: GridColDef<TProduct>[] = [
  {
    field: 'description',
    headerName: 'Descrição',
    minWidth: 280,
    flex: 1,
    valueFormatter: (value: string) => value.toUpperCase()
  },
  {
    field: 'price',
    headerName: 'Preço',
    valueFormatter: (value: number) => formatCurrency(value)
  },
  {
    field: 'purchasePrice',
    headerName: 'Custo',
    valueFormatter: (value: number) => formatCurrency(value)
  },
  {
    field: 'quantity',
    headerName: 'Qtd.',
    valueFormatter: (value: number) => value
  },
  {
    field: 'packaging',
    headerName: 'Emb.',
    valueFormatter: (value: string) => value.toUpperCase()
  },
  {
    field: 'suggestedPrice',
    headerName: 'Sugerido',
    valueGetter: (_: never, row: TProduct) => calcSuggestedPrice(row),
    valueFormatter: (value: number) => formatCurrency(value)
  },
  {
    field: 'observation',
    headerName: 'Observações',
    minWidth: 180,
    flex: 1,
    valueFormatter: (value: string) => value.toUpperCase()
  }
]
