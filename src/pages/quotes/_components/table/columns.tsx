import type { GridColDef } from '@mui/x-data-grid'

import { formatCurrency } from '@/utils'

import type { TQuoteRow } from '../../utils'

export const columns: GridColDef<TQuoteRow>[] = [
  {
    field: 'description',
    headerName: 'Descrição',
    minWidth: 200,
    flex: 1,
    valueFormatter: (value: string) => value?.toUpperCase() ?? ''
  },
  {
    field: 'orderCount',
    headerName: 'Pedidos',
    width: 90,
    type: 'number'
  },
  {
    field: 'salePrice',
    headerName: 'Venda',
    width: 120,
    valueFormatter: (value: number | null) =>
      value != null ? formatCurrency(value) : '—'
  },
  {
    field: 'bestOrderPrice',
    headerName: 'Custo',
    width: 120,
    valueFormatter: (value: number | null) =>
      value != null ? formatCurrency(value) : '—'
  },
  {
    field: 'bestSupplierName',
    headerName: 'Fornecedor',
    minWidth: 160,
    flex: 1,
    valueFormatter: (value: string | null) => value?.toUpperCase() ?? '—'
  }
]
