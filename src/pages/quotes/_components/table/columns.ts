import type { GridColDef } from '@mui/x-data-grid'

import { formatCurrency, formatNumericValue } from '@/utils'

import type { TQuoteRow } from '../../utils'

export const columns: GridColDef<TQuoteRow>[] = [
  {
    field: 'description',
    headerName: 'Descrição',
    minWidth: 200,
    flex: 1,
    valueFormatter: (value: string) => value.toUpperCase()
  },
  {
    field: 'productPrice',
    headerName: 'Venda',
    minWidth: 130,
    valueFormatter: (value: number | null) => formatCurrency(value ?? 0)
  },
  {
    field: 'supplierName',
    headerName: 'Fornecedor',
    minWidth: 160,
    valueFormatter: (value: string | null) => value?.toUpperCase() ?? ''
  },
  {
    field: 'orderPrice',
    headerName: 'Custo',
    minWidth: 130,
    valueFormatter: (value: number) => formatCurrency(value)
  },
  {
    field: 'quantity',
    headerName: 'Qtd',
    width: 80,
    valueFormatter: (value: number) => formatNumericValue(value)
  },
  {
    field: 'packing',
    headerName: 'Embalagem',
    minWidth: 120,
    valueFormatter: (value: string | null) => value?.toUpperCase() ?? ''
  },
  {
    field: 'observations',
    headerName: 'Observações',
    minWidth: 180,
    flex: 1,
    valueFormatter: (value: string | null) => value?.toUpperCase() ?? ''
  }
]
