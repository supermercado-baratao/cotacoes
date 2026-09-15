import { Paper, Typography } from '@mui/material'

import { DataView, Table } from '@/components'

import type { TMarginAlert } from '../../utils'
import { columns } from './columns'
import * as S from './style'

type TMarginAlertsProps = {
  isFetching: boolean
  marginAlerts: TMarginAlert[]
}

export const MarginAlerts = ({
  isFetching,
  marginAlerts
}: TMarginAlertsProps) => (
  <Paper elevation={2} sx={S.Wrapper}>
    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
      Produtos abaixo da margem
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      Produtos cujo preço de venda atual resulta numa margem menor que a margem
      padrão cadastrada, considerando o custo mais recente apurado no relatório
      de reajustes de preços.
    </Typography>
    <DataView
      isFetching={isFetching}
      isEmpty={!marginAlerts.length}
      emptyMessage="Nenhum produto abaixo da margem padrão no momento."
    >
      <Table items={marginAlerts} columns={columns} />
    </DataView>
  </Paper>
)
