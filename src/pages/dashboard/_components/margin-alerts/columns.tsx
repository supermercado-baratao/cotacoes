import { WarningAmber } from '@mui/icons-material'
import { Box, Chip, MenuItem, Select, Tooltip, Typography } from '@mui/material'
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import dayjs from 'dayjs'
import type { Timestamp } from 'firebase/firestore'

import { COST_DIVERGENCE_ATTENTION_PERCENT } from '@/constants'
import type { TMarginCostSource } from '@/models'
import { formatCurrency } from '@/utils'

import type { TMarginAlert, TMarginCostOption } from '../../utils'
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

const formatDate = (value: Date | null) =>
  value ? dayjs(value).format('DD/MM/YYYY') : '—'

const formatQuantity = (value: number) =>
  value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })

const costSourceLabels: Record<
  TMarginCostSource,
  { name: string; shortName: string }
> = {
  vr: { name: 'Custo c/ Imposto (VR)', shortName: 'VR' },
  entries: { name: 'Custo médio das NFs', shortName: 'NF média' },
  lastEntry: { name: 'Última NF paga', shortName: 'Últ. NF' }
}

// De onde vem o valor de cada opção do select — campo do cadastro no VR ou
// as notas que entraram na conta.
const describeCostOption = (
  option: TMarginCostOption,
  hasPeriod: boolean
): string => {
  switch (option.source) {
    case 'vr':
      return 'Cadastro do produto no VR (custocomimposto)'
    case 'entries': {
      const entries = `${option.paidEntryCount} entrada${option.paidEntryCount > 1 ? 's' : ''} paga${option.paidEntryCount > 1 ? 's' : ''}`
      const bonus = option.bonusQuantity
        ? ` + ${formatQuantity(option.bonusQuantity)} bonif.`
        : ''
      const scope = hasPeriod ? 'notas do período' : 'todas as notas'
      return `${entries} · ${formatQuantity(option.paidQuantity)} un.${bonus} · ${scope}`
    }
    case 'lastEntry':
      return `NF ${option.invoiceNumber} · ${option.supplierName} · ${formatDate(new Date(option.emissionDate))}`
  }
}

const buildCostTooltip = (row: TMarginAlert): string => {
  const packReview = row.needsPackReview
    ? ' Confira a Qtd. Embalagem: há entrada em embalagem diferente de UN sem conversão na unidade tributável da nota (Valor Unit. Trib. igual ao Valor Unit.).'
    : ''
  const source = {
    vr: 'Custo com imposto do VR.',
    entries: 'Custo médio das notas de entrada do período.',
    lastEntry: 'Custo da última nota paga do período.'
  }[row.costSource]
  const choice =
    row.costSource === row.defaultCostSource
      ? ''
      : ` Escolhido no lugar do padrão (${costSourceLabels[row.defaultCostSource].name}).`
  const marginOk =
    row.status === 'ok' ? ' Com este custo a margem fica dentro da faixa.' : ''
  if (row.vrCost == null) {
    return `${source} Sem custo com imposto no VR.${choice}${marginOk}${packReview}`
  }
  if (row.entryCost == null) {
    return `${source} Sem entrada paga no período.${choice}${marginOk}`
  }
  const divergence =
    row.costDivergence === null
      ? ''
      : ` (${formatDivergence(row.costDivergence)} sobre o VR)`
  const attention = row.isCostDivergent
    ? ` Atenção: diverge mais de ${COST_DIVERGENCE_ATTENTION_PERCENT}% do custo do VR — confira a embalagem, bonificações ou o custo cadastrado no VR.`
    : ''
  return `${source}${choice} Custo médio das notas do período: ${formatCurrency(row.entryCost)}${divergence}.${attention}${marginOk}${packReview}`
}

const renderCostValue = (row: TMarginAlert) => (
  <Tooltip title={buildCostTooltip(row)}>
    <Box sx={S.DescriptionCell}>
      {formatCurrency(row.cost)}
      <Typography variant="caption" color="text.secondary">
        {costSourceLabels[row.costSource].shortName}
      </Typography>
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

// Select da fonte de custo usada na margem: cada opção traz o nome do campo,
// o valor e de onde ele vem. O valor na célula é compacto (custo + sigla da
// fonte + ícone de atenção) pra grade caber na tela sem esconder a coluna de
// ações; o detalhe de divergência fica no tooltip.
const buildRenderCost =
  (
    handleCostSourceChange: (
      alert: TMarginAlert,
      source: TMarginCostSource
    ) => void,
    hasPeriod: boolean
  ) =>
  ({ row }: GridRenderCellParams<TMarginAlert>) => (
    // Setas/espaço dentro do select (e do menu, que borbulha pela árvore do
    // React) não devem mover o foco entre as células da grade.
    <Box sx={S.CostCell} onKeyDown={(event) => event.stopPropagation()}>
      <Select
        variant="standard"
        size="small"
        fullWidth
        disableUnderline
        value={row.costSource}
        onChange={(event) =>
          handleCostSourceChange(row, event.target.value as TMarginCostSource)
        }
        renderValue={() => renderCostValue(row)}
        inputProps={{ 'aria-label': `Fonte do custo de ${row.description}` }}
      >
        {row.costOptions.map((option) => (
          <MenuItem key={option.source} value={option.source}>
            <Box sx={S.CostOption}>
              <Box sx={S.CostOptionHeader}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {costSourceLabels[option.source].name}
                </Typography>
                {option.source === row.defaultCostSource && (
                  <Chip label="Padrão" size="small" variant="outlined" />
                )}
                <Typography variant="body2" sx={S.CostOptionValue}>
                  {formatCurrency(option.cost)}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {describeCostOption(option, hasPeriod)}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </Box>
  )

const renderMarginGap = ({ row }: GridRenderCellParams<TMarginAlert>) => {
  if (row.status === 'ok') return 'Dentro da margem'
  return `${row.status === 'below' ? '-' : '+'}${row.marginGap.toFixed(1)} p.p.`
}

// `hasPeriod`: o custo das notas considera só o período filtrado (senão, todas
// as notas carregadas) — entra na descrição das opções do select.
export const buildColumns = (
  handleCostSourceChange: (
    alert: TMarginAlert,
    source: TMarginCostSource
  ) => void,
  hasPeriod: boolean
): GridColDef<TMarginAlert>[] => [
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
    minWidth: 200,
    renderCell: buildRenderCost(handleCostSourceChange, hasPeriod)
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
    minWidth: 150,
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
