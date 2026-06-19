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
    field: 'orderPrices',
    headerName: 'Custo',
    width: 180,
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
