import type { GridColDef } from '@mui/x-data-grid'

import type { TProduct } from '@/models'
import { formatCurrency } from '@/utils'

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
    minWidth: 160,
    valueFormatter: (value: number | null) => formatCurrency(value ?? 0)
  },
  {
    field: 'observations',
    headerName: 'Observações',
    minWidth: 180,
    flex: 1,
    valueFormatter: (value: string | null) => value?.toUpperCase()
  }
]
