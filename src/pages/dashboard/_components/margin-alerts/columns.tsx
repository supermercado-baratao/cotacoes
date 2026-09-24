import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import dayjs from 'dayjs'
import type { Timestamp } from 'firebase/firestore'

import { formatCurrency } from '@/utils'

import type { TMarginAlert } from '../../utils'

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
    valueFormatter: (value: string) => value.toUpperCase()
  },
  {
    field: 'price',
    headerName: 'Preço de Venda',
    valueFormatter: (value: number) => formatCurrency(value)
  },
  {
    field: 'cost',
    headerName: 'Custo',
    valueFormatter: (value: number) => formatCurrency(value)
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
