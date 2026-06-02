import type { GridColDef } from '@mui/x-data-grid'

import { formatCurrency } from '@/utils'

import type { TQuoteRow } from '../../utils'
import { TYPE_LABELS } from './orders-drawer/constants'

export const columns: GridColDef<TQuoteRow>[] = [
  {
    field: 'description',
    headerName: 'Descrição',
    minWidth: 200,
    flex: 1,
    valueFormatter: (value: string) => value?.toUpperCase() ?? ''
  },
  {
    field: 'type',
    headerName: 'Tipo',
    width: 100,
    valueFormatter: (value: TQuoteRow['type']) => TYPE_LABELS[value] ?? ''
  },
  {
    field: 'orderCount',
    headerName: 'Pedidos',
    width: 90,
    type: 'number'
  },
  {
    field: 'bestOrderPrice',
    headerName: 'Melhor Preço',
    width: 140,
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
