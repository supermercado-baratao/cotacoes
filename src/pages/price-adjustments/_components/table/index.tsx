import {
  CheckCircle,
  ExpandMore,
  History,
  PriceCheck,
  TrendingDown,
  TrendingFlat,
  TrendingUp,
  WarningAmber
} from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  TablePagination,
  Tooltip,
  Typography
} from '@mui/material'
import { useMemo, useState } from 'react'

import { Table as _Table } from '@/components/blocks/table'
import {
  getFamilyMarginStatus,
  hasDivergentFamilyPrices,
  type TPriceAdjustmentDisplayRow,
  type TPriceAdjustmentGroup
} from '@/pages/price-adjustments/utils'
import { formatCurrency } from '@/utils/formatters'
import { marginStatusConfig, type TMarginStatus } from '@/utils/margin'

import { columns } from './columns'
import * as S from './style'

type TTableProps = {
  groups: TPriceAdjustmentGroup<TPriceAdjustmentDisplayRow>[]
}

const PAGE_SIZE = 50

const getGroupKey = (
  group: TPriceAdjustmentGroup<TPriceAdjustmentDisplayRow>
) => group.familyId ?? group.kind

const marginStatusIcon: Record<TMarginStatus, typeof CheckCircle> = {
  below: TrendingDown,
  above: TrendingUp,
  ok: CheckCircle
}

const marginConfig: Record<
  TMarginStatus | 'mixed',
  { label: string; color: 'success' | 'error' | 'warning' }
> = {
  ...marginStatusConfig,
  mixed: { label: 'Margem variada entre os produtos', color: 'warning' }
}

// Previous and current prices come from the REP and are shared by every product
// of a family, so reading the first row is enough. The margin depends on the
// real cost of each product, so it is summarized separately.
export const PriceSummary = ({
  rows
}: {
  rows: TPriceAdjustmentDisplayRow[]
}) => {
  const [first] = rows
  const hasDivergence = hasDivergentFamilyPrices(rows)
  const marginStatus = getFamilyMarginStatus(rows)

  const PriceTrendIcon =
    first.newSalePrice === first.previousPrice
      ? TrendingFlat
      : first.newSalePrice > first.previousPrice
        ? TrendingUp
        : TrendingDown
  const priceTrendColor =
    first.newSalePrice === first.previousPrice
      ? 'text.secondary'
      : first.newSalePrice > first.previousPrice
        ? 'error.main'
        : 'success.main'

  const MarginIcon = marginStatus
    ? marginStatus === 'mixed'
      ? WarningAmber
      : marginStatusIcon[marginStatus]
    : null

  return (
    <Box sx={S.PriceSummary}>
      <Box sx={S.PriceSummaryItem}>
        <Box sx={S.PriceSummaryItemLabel}>
          <History fontSize="inherit" color="disabled" />
          <Typography variant="caption" color="text.secondary">
            Preço Anterior
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {formatCurrency(first.previousPrice)}
        </Typography>
      </Box>

      <Box sx={S.PriceSummaryTrend}>
        <PriceTrendIcon fontSize="small" sx={{ color: priceTrendColor }} />
      </Box>

      <Box sx={S.PriceSummaryItem}>
        <Box sx={S.PriceSummaryItemLabel}>
          <PriceCheck fontSize="inherit" color="disabled" />
          <Typography variant="caption" color="text.secondary">
            Preço Atual
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {formatCurrency(first.newSalePrice)}
        </Typography>
      </Box>

      {marginStatus && MarginIcon && (
        <>
          <Box sx={S.PriceSummaryDivider} />
          <Chip
            icon={<MarginIcon fontSize="small" />}
            label={marginConfig[marginStatus].label}
            color={marginConfig[marginStatus].color}
            variant="outlined"
            size="small"
          />
        </>
      )}

      {hasDivergence && (
        <Tooltip title="Preços divergentes entre produtos desta família — confira o cadastro no REP.">
          <WarningAmber fontSize="small" color="warning" sx={{ ml: 'auto' }} />
        </Tooltip>
      )}
    </Box>
  )
}

export const Table = ({ groups }: TTableProps) => {
  // Family groups already show the prices in the summary box, so the product
  // table starts collapsed. "Não cadastrado" has no summary box to make up for
  // it, so hiding it would only get in the way of checking.
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    () =>
      new Set(groups.filter((g) => g.kind === 'unregistered').map(getGroupKey))
  )
  const [page, setPage] = useState(0)

  const pageCount = Math.max(1, Math.ceil(groups.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount - 1)
  const pagedGroups = useMemo(
    () =>
      groups.slice(
        currentPage * PAGE_SIZE,
        currentPage * PAGE_SIZE + PAGE_SIZE
      ),
    [groups, currentPage]
  )

  const toggleExpanded = (key: string) =>
    setExpandedKeys((previous) => {
      const next = new Set(previous)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })

  return (
    <Box>
      {pagedGroups.map((group) => {
        const key = getGroupKey(group)
        const isExpanded = expandedKeys.has(key)

        return (
          <Accordion
            key={key}
            expanded={isExpanded}
            onChange={() => toggleExpanded(key)}
            disableGutters
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={S.SummaryContent}>
                <Box sx={S.SummaryHeader}>
                  <Typography sx={{ fontWeight: 600 }}>
                    {group.familyDescription.toUpperCase()}
                  </Typography>
                  <Chip
                    label={`${group.rows.length} ${group.rows.length === 1 ? 'produto' : 'produtos'}`}
                    size="small"
                  />
                </Box>
                {group.kind === 'family' && <PriceSummary rows={group.rows} />}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {/* Mounting every DataGrid at once, even collapsed, is expensive
                 with many groups. */}
              {isExpanded && (
                <_Table
                  columns={columns}
                  items={group.rows}
                  getRowId={(row) => row.code}
                  autosizeOnMount={false}
                />
              )}
            </AccordionDetails>
          </Accordion>
        )
      })}

      {groups.length > PAGE_SIZE && (
        <TablePagination
          component="div"
          count={groups.length}
          page={currentPage}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={PAGE_SIZE}
          rowsPerPageOptions={[]}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} de ${count}`
          }
        />
      )}
    </Box>
  )
}
