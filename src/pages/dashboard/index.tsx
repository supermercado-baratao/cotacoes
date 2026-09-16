import {
  Inventory2,
  PriceChange,
  ReceiptLong,
  RequestQuote,
  TrendingUp
} from '@mui/icons-material'
import { Box, Typography } from '@mui/material'

import { MarginAlerts, StatCard } from './_components'
import * as S from './style'
import { useDashboardHandler } from './use-dashboard-handler'

export const Dashboard = () => {
  const { isFetching, stats, marginAlerts } = useDashboardHandler()

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
      <MarginAlerts
        direction="below"
        isFetching={isFetching}
        marginAlerts={marginAlerts.below}
      />
      <MarginAlerts
        direction="above"
        isFetching={isFetching}
        marginAlerts={marginAlerts.above}
      />
    </>
  )
}
