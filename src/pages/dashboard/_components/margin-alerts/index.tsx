import { ReceiptLong } from '@mui/icons-material'
import { Paper, Typography } from '@mui/material'
import { GridActionsCellItem } from '@mui/x-data-grid'
import { useMemo, useState } from 'react'

import { DataView } from '@/components/blocks/data-view'
import { Table } from '@/components/blocks/table'
import type { TInvoiceDateRange } from '@/models/invoice-model/types'
import type { TMarginCostSource } from '@/models/product-model/types'
import { useAppStore } from '@/stores/use-app-store'

import {
  addEntryUnitCosts,
  getInvoiceEntriesForProduct,
  type TMarginAlert
} from '../../utils'
import { buildColumns } from './columns'
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
      'Produtos cujo preço de venda atual resulta numa margem menor que a margem mínima aceitável definida em Configurações, considerando o custo com imposto do VR ou, se o produto não tiver custo no VR ou tiver a Qtd. Embalagem corrigida nos detalhes da nota, o custo médio das notas de entrada do período (convertido pela embalagem corrigida, pela unidade tributável da nota quando a embalagem não é UN ou pela embalagem do VR, com bonificações entrando só na quantidade). Use o select da coluna Custo para calcular a margem com outra fonte de custo.',
    emptyMessage: 'Nenhum produto abaixo da margem mínima no momento.'
  },
  above: {
    title: 'Produtos acima da margem',
    description:
      'Produtos cujo preço de venda atual resulta numa margem maior que a margem máxima esperada definida em Configurações, considerando o custo com imposto do VR ou, se o produto não tiver custo no VR ou tiver a Qtd. Embalagem corrigida nos detalhes da nota, o custo médio das notas de entrada do período (convertido pela embalagem corrigida, pela unidade tributável da nota quando a embalagem não é UN ou pela embalagem do VR, com bonificações entrando só na quantidade). Use o select da coluna Custo para calcular a margem com outra fonte de custo.',
    emptyMessage: 'Nenhum produto acima da margem máxima no momento.'
  }
}

type TMarginAlertsProps = {
  direction: TMarginAlertsDirection
  isFetching: boolean
  marginAlerts: TMarginAlert[]
  dateRange: TInvoiceDateRange | null
  handleCostSourceChange: (
    alert: TMarginAlert,
    source: TMarginCostSource
  ) => void
}

export const MarginAlerts = ({
  direction,
  isFetching,
  marginAlerts,
  dateRange,
  handleCostSourceChange
}: TMarginAlertsProps) => {
  const { invoices, products, suppliers, packingDefaults } = useAppStore()
  const [drawerAlert, setDrawerAlert] = useState<TMarginAlert | null>(null)
  const copy = copyByDirection[direction]
  const columns = useMemo(
    () => buildColumns(handleCostSourceChange, dateRange !== null),
    [handleCostSourceChange, dateRange]
  )

  const invoiceEntries = drawerAlert
    ? addEntryUnitCosts(
        getInvoiceEntriesForProduct(invoices ?? [], drawerAlert.id, dateRange),
        products?.find((product) => product.id === drawerAlert.id) ?? null,
        suppliers ?? [],
        packingDefaults ?? []
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
        isEmpty={marginAlerts.length === 0}
        emptyMessage={copy.emptyMessage}
      >
        {/* Grade paginada (até 100 linhas): sem virtualização, a coluna de
            ações continua renderizada mesmo quando as colunas passam da
            largura da tela e exigem rolagem horizontal. */}
        <Table
          items={marginAlerts}
          columns={columns}
          disableVirtualization
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
