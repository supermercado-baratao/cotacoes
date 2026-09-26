import { ReceiptLong } from '@mui/icons-material'
import { Paper, Typography } from '@mui/material'
import { GridActionsCellItem } from '@mui/x-data-grid'
import { useState } from 'react'

import { DataView, Table } from '@/components'
import type { TInvoiceDateRange } from '@/models'
import { useAppStore } from '@/stores'

import {
  addEntryUnitCosts,
  getInvoiceEntriesForProduct,
  type TMarginAlert
} from '../../utils'
import { columns } from './columns'
import { InvoiceEntriesDrawer } from './invoice-entries-drawer'
import * as S from './style'

type TMarginAlertsDirection = 'below' | 'above'

const copyByDirection: Record<
  TMarginAlertsDirection,
  { title: string; description: string; emptyMessage: string }
> = {
  below: {
    title: 'Produtos abaixo da margem',
    description:
      'Produtos cujo preço de venda atual resulta numa margem menor que a margem mínima aceitável definida em Configurações, considerando o custo médio das notas de entrada do período (convertido pela embalagem do VR, com bonificações entrando só na quantidade) ou, sem entradas, o custo com imposto do VR.',
    emptyMessage: 'Nenhum produto abaixo da margem mínima no momento.'
  },
  above: {
    title: 'Produtos acima da margem',
    description:
      'Produtos cujo preço de venda atual resulta numa margem maior que a margem máxima esperada definida em Configurações, considerando o custo médio das notas de entrada do período (convertido pela embalagem do VR, com bonificações entrando só na quantidade) ou, sem entradas, o custo com imposto do VR.',
    emptyMessage: 'Nenhum produto acima da margem máxima no momento.'
  }
}

type TMarginAlertsProps = {
  direction: TMarginAlertsDirection
  isFetching: boolean
  marginAlerts: TMarginAlert[]
  dateRange: TInvoiceDateRange | null
}

export const MarginAlerts = ({
  direction,
  isFetching,
  marginAlerts,
  dateRange
}: TMarginAlertsProps) => {
  const { invoices, products, suppliers } = useAppStore()
  const [drawerAlert, setDrawerAlert] = useState<TMarginAlert | null>(null)
  const copy = copyByDirection[direction]

  const invoiceEntries = drawerAlert
    ? addEntryUnitCosts(
        getInvoiceEntriesForProduct(invoices ?? [], drawerAlert.id, dateRange),
        products?.find((product) => product.id === drawerAlert.id) ?? null,
        suppliers ?? []
      )
    : []

  return (
    <Paper elevation={2} sx={S.Wrapper}>
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
        {copy.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {copy.description}
      </Typography>
      <DataView
        isFetching={isFetching}
        isEmpty={!marginAlerts.length}
        emptyMessage={copy.emptyMessage}
      >
        <Table
          items={marginAlerts}
          columns={columns}
          getExtraActions={(alert) => [
            <GridActionsCellItem
              key="view-invoices"
              icon={<ReceiptLong />}
              label="Ver notas"
              onClick={() => setDrawerAlert(alert)}
            />
          ]}
        />
      </DataView>
      <InvoiceEntriesDrawer
        alert={drawerAlert}
        entries={invoiceEntries}
        handleClose={() => setDrawerAlert(null)}
      />
    </Paper>
  )
}
