import type { GridColDef } from '@mui/x-data-grid'

import { formatCurrency } from '@/utils'

import type { TMarginAlert } from '../../utils'

export const columns: GridColDef<TMarginAlert>[] = [
  {
    field: 'id',
    headerName: 'Cód. VR'
  },
  {
    field: 'description',
    headerName: 'Descrição',
    minWidth: 240,
    flex: 1,
    valueFormatter: (value: string) => value.toUpperCase()
  },
  {
    field: 'price',
    headerName: 'Preço de Venda',
    valueFormatter: (value: number) => formatCurrency(value)
  },
  {
    field: 'cost',
    headerName: 'Custo',
    valueFormatter: (value: number) => formatCurrency(value)
  },
  {
    field: 'actualMargin',
    headerName: 'Margem Atual',
    valueFormatter: (value: number) => `${value.toFixed(1)}%`
  },
  {
    field: 'targetMargin',
    headerName: 'Margem Padrão',
    valueFormatter: (value: number) => `${value.toFixed(1)}%`
  },
  {
    field: 'marginGap',
    headerName: 'Diferença',
    valueFormatter: (value: number) =>
      `${value > 0 ? '-' : '+'}${Math.abs(value).toFixed(1)} p.p.`
  }
]
