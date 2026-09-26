import { WarningAmber } from '@mui/icons-material'
import { Box, Chip, Tooltip } from '@mui/material'
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import dayjs from 'dayjs'
import type { Timestamp } from 'firebase/firestore'

import { COST_DIVERGENCE_ATTENTION_PERCENT } from '@/constants'
import { formatCurrency } from '@/utils'

import type { TMarginAlert } from '../../utils'
import * as S from './style'

const renderDescription = ({ row }: GridRenderCellParams<TMarginAlert>) => (
  <Box sx={S.DescriptionCell}>
    {row.description.toUpperCase()}
    {row.hasBonus && (
      <Tooltip title="Houve bonificação no período: a quantidade bonificada entrou no custo médio sem o valor da nota">
        <Chip label="Bonificação" size="small" color="info" />
      </Tooltip>
    )}
  </Box>
)

const renderCost = ({ row }: GridRenderCellParams<TMarginAlert>) => (
  <Tooltip
    title={
      row.costSource === 'entries'
        ? 'Custo médio das notas de entrada do período'
        : 'Sem entrada paga no período: custo com imposto do VR'
    }
  >
    <span>
      {formatCurrency(row.cost)}
      {row.costSource === 'vr' && ' (VR)'}
    </span>
  </Tooltip>
)

const renderCostDivergence = ({ row }: GridRenderCellParams<TMarginAlert>) => {
  if (row.costDivergence === null) return '—'
  const label = `${row.costDivergence > 0 ? '+' : ''}${row.costDivergence.toFixed(1)}%`
  if (!row.isCostDivergent) return label
  return (
    <Tooltip
      title={`Atenção: o custo das notas diverge mais de ${COST_DIVERGENCE_ATTENTION_PERCENT}% do custo do VR. Confira a embalagem, bonificações ou o custo cadastrado no VR.`}
    >
      <Chip
        icon={<WarningAmber />}
        label={label}
        size="small"
        color="warning"
      />
    </Tooltip>
  )
}

const renderMarginGap = ({ row }: GridRenderCellParams<TMarginAlert>) =>
  `${row.status === 'below' ? '-' : '+'}${row.marginGap.toFixed(1)} p.p.`

const formatDate = (value: Date | null) =>
  value ? dayjs(value).format('DD/MM/YYYY') : '—'

export const columns: GridColDef<TMarginAlert>[] = [
  {
    field: 'id',
    headerName: 'Cód. VR'
  },
  {
    field: 'description',
    headerName: 'Descrição',
    minWidth: 280,
    flex: 1,
    renderCell: renderDescription
  },
  {
    field: 'price',
    headerName: 'Preço de Venda',
    valueFormatter: (value: number) => formatCurrency(value)
  },
  {
    field: 'cost',
    headerName: 'Custo',
    minWidth: 120,
    renderCell: renderCost
  },
  {
    field: 'vrCost',
    headerName: 'Custo VR',
    valueFormatter: (value: number | null) =>
      value == null ? '—' : formatCurrency(value)
  },
  {
    field: 'costDivergence',
    headerName: 'Divergência de Custo',
    minWidth: 120,
    renderCell: renderCostDivergence
  },
  {
    field: 'actualMargin',
    headerName: 'Margem Atual',
    valueFormatter: (value: number) => `${value.toFixed(1)}%`
  },
  {
    field: 'thresholdMargin',
    headerName: 'Limite de Margem',
    valueFormatter: (value: number) => `${value.toFixed(1)}%`
  },
  {
    field: 'marginGap',
    headerName: 'Diferença',
    renderCell: renderMarginGap
  },
  {
    field: 'updatedAt',
    headerName: 'Última Atualização',
    type: 'date',
    valueGetter: (value: Timestamp) => value.toDate(),
    valueFormatter: formatDate
  },
  {
    field: 'vrCreatedAt',
    headerName: 'Cadastro VR',
    type: 'date',
    valueGetter: (value: string) => (value ? new Date(value) : null),
    valueFormatter: formatDate
  },
  {
    field: 'lastEntryDate',
    headerName: 'Última Entrada',
    type: 'date',
    valueGetter: (value: string | null) => (value ? new Date(value) : null),
    valueFormatter: formatDate
  }
]
