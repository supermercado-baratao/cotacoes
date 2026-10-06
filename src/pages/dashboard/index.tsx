import {
  Inventory2,
  PriceChange,
  ReceiptLong,
  RequestQuote,
  TrendingUp
} from '@mui/icons-material'
import {
  Box,
  FormControlLabel,
  Switch,
  TextField,
  Typography
} from '@mui/material'

import { DataView } from '@/components/blocks/data-view'

import { MarginAlerts } from './_components/margin-alerts'
import { StatCard } from './_components/stat-card'
import * as S from './style'
import { useDashboardHandler } from './use-dashboard-handler'

export const Dashboard = () => {
  const {
    isFetching,
    stats,
    marginAlerts,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isPeriodFilterEnabled,
    setIsPeriodFilterEnabled,
    activeDateRange,
    handleCostSourceChange
  } = useDashboardHandler()

  return (
    <>
      <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
        Dashboard
      </Typography>
      <Box sx={S.StatsGrid}>
        <StatCard
          label="Produtos cadastrados"
          value={isFetching ? '—' : String(stats.productCount)}
          icon={Inventory2}
        />
        <StatCard
          label="Cotações abertas"
          value={isFetching ? '—' : String(stats.openQuoteCount)}
          icon={RequestQuote}
        />
        <StatCard
          label="Notas pendentes de verificação"
          value={isFetching ? '—' : String(stats.pendingInvoiceCount)}
          icon={ReceiptLong}
          color={
            !isFetching && stats.pendingInvoiceCount ? 'warning' : 'primary'
          }
        />
        <StatCard
          label="Produtos abaixo da margem"
          value={isFetching ? '—' : String(stats.belowMarginCount)}
          icon={PriceChange}
          color={!isFetching && stats.belowMarginCount ? 'error' : 'primary'}
        />
        <StatCard
          label="Produtos acima da margem"
          value={isFetching ? '—' : String(stats.aboveMarginCount)}
          icon={TrendingUp}
          color={!isFetching && stats.aboveMarginCount ? 'warning' : 'primary'}
        />
      </Box>
      <Box sx={S.DateRangeWrapper}>
        <FormControlLabel
          control={
            <Switch
              checked={isPeriodFilterEnabled}
              onChange={(e) => setIsPeriodFilterEnabled(e.target.checked)}
            />
          }
          label="Filtrar por entrada no período"
        />
        <Typography variant="body2" color="text.secondary">
          Entrada entre:
        </Typography>
        <TextField
          label="Início do período"
          type="date"
          size="small"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          sx={S.DateField}
          disabled={!isPeriodFilterEnabled}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="Fim do período"
          type="date"
          size="small"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          sx={S.DateField}
          disabled={!isPeriodFilterEnabled}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Box>
      <DataView isFetching={isFetching}>
        <MarginAlerts
          direction="below"
          isFetching={isFetching}
          marginAlerts={marginAlerts.below}
          dateRange={activeDateRange}
          handleCostSourceChange={handleCostSourceChange}
        />
        <MarginAlerts
          direction="above"
          isFetching={isFetching}
          marginAlerts={marginAlerts.above}
          dateRange={activeDateRange}
          handleCostSourceChange={handleCostSourceChange}
        />
      </DataView>
    </>
  )
}
