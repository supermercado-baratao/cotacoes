import { Paper, Typography } from '@mui/material'

import { DataView, Table } from '@/components'

import type { TMarginAlert } from '../../utils'
import { columns } from './columns'
import * as S from './style'

type TMarginAlertsDirection = 'below' | 'above'

const copyByDirection: Record<
  TMarginAlertsDirection,
  { title: string; description: string; emptyMessage: string }
> = {
  below: {
    title: 'Produtos abaixo da margem',
    description:
      'Produtos cujo preço de venda atual resulta numa margem menor que a margem padrão cadastrada, considerando o custo mais recente apurado no relatório de reajustes de preços.',
    emptyMessage: 'Nenhum produto abaixo da margem padrão no momento.'
  },
  above: {
    title: 'Produtos acima da margem',
    description:
      'Produtos cujo preço de venda atual resulta numa margem maior que a margem padrão cadastrada, considerando o custo mais recente apurado no relatório de reajustes de preços.',
    emptyMessage: 'Nenhum produto acima da margem padrão no momento.'
  }
}

type TMarginAlertsProps = {
  direction: TMarginAlertsDirection
  isFetching: boolean
  marginAlerts: TMarginAlert[]
}

export const MarginAlerts = ({
  direction,
  isFetching,
  marginAlerts
}: TMarginAlertsProps) => {
  const copy = copyByDirection[direction]

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
        <Table items={marginAlerts} columns={columns} />
      </DataView>
    </Paper>
  )
}
