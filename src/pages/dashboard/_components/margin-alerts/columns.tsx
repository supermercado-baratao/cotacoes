import { WarningAmber } from '@mui/icons-material'
import { Box, Chip, Tooltip, Typography } from '@mui/material'
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

const formatDivergence = (divergence: number) =>
  `${divergence > 0 ? '+' : ''}${divergence.toFixed(1)}%`

const buildCostTooltip = (row: TMarginAlert): string => {
  const packReview = row.needsPackReview
    ? ' Confira a Qtd. Embalagem: há entrada em embalagem diferente de UN sem conversão na unidade tributável da nota (Valor Unit. Trib. igual ao Valor Unit.).'
    : ''
  if (row.costSource === 'entries') {
    return `Sem custo com imposto no VR: custo médio das notas de entrada do período.${packReview}`
  }
  if (row.entryCost == null) {
    return 'Custo com imposto do VR. Sem entrada paga no período'
  }
  const divergence =
    row.costDivergence === null
      ? ''
      : ` (${formatDivergence(row.costDivergence)})`
  const attention = row.isCostDivergent
    ? ` Atenção: diverge mais de ${COST_DIVERGENCE_ATTENTION_PERCENT}% do custo do VR — confira a embalagem, bonificações ou o custo cadastrado no VR.`
    : ''
  return `Custo com imposto do VR. Custo médio das notas do período: ${formatCurrency(row.entryCost)}${divergence}.${attention}${packReview}`
}

// Custo usado na margem, com o custo das notas e a divergência no tooltip e só
// um ícone de atenção na célula — compacto pra grade caber na tela sem
// esconder a coluna de ações.
const renderCost = ({ row }: GridRenderCellParams<TMarginAlert>) => (
  <Tooltip title={buildCostTooltip(row)}>
    <Box sx={S.DescriptionCell}>
      {formatCurrency(row.cost)}
      {row.costSource === 'entries' && (
        <Typography variant="caption" color="text.secondary">
          NF
        </Typography>
      )}
      {(row.isCostDivergent || row.needsPackReview) && (
        <WarningAmber
          color="warning"
          fontSize="small"
          aria-label={
            row.isCostDivergent
              ? 'Atenção: custo divergente do VR'
              : 'Atenção: conferir quantidade da embalagem'
          }
        />
      )}
    </Box>
  </Tooltip>
)

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
    minWidth: 240,
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
    renderCell: renderCost
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
