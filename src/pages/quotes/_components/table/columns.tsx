import { Category, Inventory2 } from '@mui/icons-material'
import { Box } from '@mui/material'
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'

import { formatCurrency } from '@/utils/formatters'

import type { TQuoteRow } from '../../utils'
import * as S from './style'

const formatPriceRange = (min: number | null, max: number | null) => {
  if (min == null || max == null) return '—'
  return min === max
    ? formatCurrency(min)
    : `${formatCurrency(min)} – ${formatCurrency(max)}`
}

const renderReference = ({ row }: GridRenderCellParams<TQuoteRow>) => {
  const ReferenceIcon = row.priceRef?.type === 'product' ? Inventory2 : Category

  const label = row.referenceDescription?.toUpperCase() ?? '—'

  return (
    <Box sx={S.Reference}>
      <ReferenceIcon fontSize="small" color="action" />
      {label}
    </Box>
  )
}

export const columns: GridColDef<TQuoteRow>[] = [
  {
    field: 'description',
    headerName: 'Descrição',
    minWidth: 200,
    flex: 1,
    valueFormatter: (value: string) => value?.toUpperCase() ?? ''
  },
  {
    field: 'salePrice',
    headerName: 'Venda',
    valueFormatter: (value: number | null) =>
      value != null ? formatCurrency(value) : '—'
  },
  {
    field: 'referenceDescription',
    headerName: 'Referência de venda',
    minWidth: 180,
    flex: 1,
    renderCell: renderReference
  },
  {
    field: 'orderCount',
    headerName: 'Pedidos',
    type: 'number'
  },
  {
    field: 'minPrice',
    headerName: 'Custo',
    renderCell: ({ row }: GridRenderCellParams<TQuoteRow>) =>
      formatPriceRange(row.minPrice, row.maxPrice)
  },
  {
    field: 'supplierCount',
    headerName: 'Fornecedores',
    type: 'number'
  }
]
