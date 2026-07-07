import { Category, Inventory2 } from '@mui/icons-material'
import { Box, Divider } from '@mui/material'
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { Fragment } from 'react'

import { formatCurrency } from '@/utils'

import type { TQuoteRow } from '../../utils'
import * as S from './style'

const joinWithDivider = (items: string[]) =>
  items.length ? (
    <Box sx={S.Divider}>
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && <Divider orientation="vertical" />}
          {item}
        </Fragment>
      ))}
    </Box>
  ) : (
    '—'
  )

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
    field: 'orderCount',
    headerName: 'Pedidos',
    type: 'number'
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
    field: 'orderPrices',
    headerName: 'Custo',
    renderCell: ({ value }: GridRenderCellParams<TQuoteRow, number[]>) =>
      joinWithDivider((value ?? []).map(formatCurrency))
  },
  {
    field: 'supplierNames',
    headerName: 'Fornecedor',
    minWidth: 160,
    flex: 1,
    renderCell: ({ value }: GridRenderCellParams<TQuoteRow, string[]>) =>
      joinWithDivider((value ?? []).map((n) => n.toUpperCase()))
  }
]
