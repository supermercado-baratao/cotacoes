import { Box, Chip, Divider, Typography } from '@mui/material'
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import dayjs from 'dayjs'
import { Fragment } from 'react'

import type { TPriceAdjustmentDisplayRow as TPriceAdjustmentRow } from '@/pages/price-adjustments/utils'
import { formatCurrency } from '@/utils/formatters'
import { marginStatusConfig } from '@/utils/margin'

import * as S from './style'

const renderMarginStatus = ({
  row
}: GridRenderCellParams<TPriceAdjustmentRow>) =>
  row.marginStatus ? (
    <Chip
      label={marginStatusConfig[row.marginStatus].label}
      color={marginStatusConfig[row.marginStatus].color}
      size="small"
    />
  ) : (
    '—'
  )

const joinWithDivider = (items: string[]) =>
  items.length > 0 ? (
    <Box sx={S.Divider}>
      {items.map((item, index) => (
        <Fragment key={index}>
          {index > 0 && <Divider orientation="vertical" />}
          {item}
        </Fragment>
      ))}
    </Box>
  ) : (
    '—'
  )

const renderDescription = ({
  row
}: GridRenderCellParams<TPriceAdjustmentRow>) => (
  <Box sx={S.DescriptionCell}>
    {row.description.toUpperCase()}
    {!row.productFound && (
      <Chip label="Não cadastrado" color="error" size="small" />
    )}
  </Box>
)

const renderResolvedCost = ({
  row
}: GridRenderCellParams<TPriceAdjustmentRow>) => (
  <Box sx={S.CostCell}>
    {formatCurrency(row.resolvedCost)}
    {row.costSource === 'file' && (
      <Chip label="Sem cotação recente" size="small" />
    )}
  </Box>
)

const renderCostDivergence = ({
  row
}: GridRenderCellParams<TPriceAdjustmentRow>) => {
  if (row.costDivergence == null) return '—'
  return (
    <Typography
      variant="body2"
      color={row.costDivergence > 0 ? 'error.main' : 'success.main'}
    >
      {formatCurrency(row.costDivergence)}
    </Typography>
  )
}

export const columns: GridColDef<TPriceAdjustmentRow>[] = [
  { field: 'code', headerName: 'Código', width: 100 },
  {
    field: 'description',
    headerName: 'Descrição',
    minWidth: 240,
    flex: 1,
    renderCell: renderDescription
  },
  {
    field: 'previousPrice',
    headerName: 'Preço Anterior',
    valueFormatter: (value: number) => formatCurrency(value)
  },
  {
    field: 'newSalePrice',
    headerName: 'Preço Atual',
    valueFormatter: (value: number) => formatCurrency(value)
  },
  {
    field: 'fileCost',
    headerName: 'Custo REP',
    valueFormatter: (value: number) => formatCurrency(value)
  },
  {
    field: 'resolvedCost',
    headerName: 'Custo Real (cotação)',
    minWidth: 170,
    renderCell: renderResolvedCost
  },
  {
    field: 'costDivergence',
    headerName: 'Divergência de Custo',
    minWidth: 150,
    renderCell: renderCostDivergence
  },
  {
    field: 'marginStatus',
    headerName: 'Situação de Margem',
    minWidth: 160,
    renderCell: renderMarginStatus
  },
  {
    field: 'supplierNames',
    headerName: 'Fornecedor(es)',
    minWidth: 180,
    flex: 1,
    renderCell: ({
      value
    }: GridRenderCellParams<TPriceAdjustmentRow, string[]>) =>
      joinWithDivider((value ?? []).map((n) => n.toUpperCase()))
  },
  {
    field: 'supplierCosts',
    headerName: 'Custo por Fornecedor',
    minWidth: 160,
    renderCell: ({
      value
    }: GridRenderCellParams<TPriceAdjustmentRow, number[]>) =>
      joinWithDivider((value ?? []).map(formatCurrency))
  },
  {
    field: 'quoteDate',
    headerName: 'Cotação usada',
    valueFormatter: (value: string | null) =>
      value ? dayjs(value).format('DD/MM/YYYY') : '—'
  },
  {
    field: 'lastEntryDate',
    headerName: 'Últ. Entrada (REP)',
    valueFormatter: (value: string | null) => value ?? '—'
  },
  { field: 'changeDateTime', headerName: 'Data/Hora Alteração', width: 150 },
  { field: 'user', headerName: 'Usuário', width: 140 }
]
