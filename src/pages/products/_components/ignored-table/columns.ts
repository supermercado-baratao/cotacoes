import type { GridColDef } from '@mui/x-data-grid'
import dayjs from 'dayjs'

import type { TIgnoredProductRow } from '../../utils'

export const columns: GridColDef<TIgnoredProductRow>[] = [
  {
    field: 'description',
    headerName: 'Descrição',
    flex: 1,
    minWidth: 240,
    valueFormatter: (value: string) => value.toUpperCase()
  },
  {
    field: 'barcode',
    headerName: 'Cód. Barras',
    valueFormatter: (value: string | null) => value ?? '—'
  },
  {
    field: 'reason',
    headerName: 'Motivo',
    minWidth: 220,
    flex: 1
  },
  {
    field: 'ignoredAt',
    headerName: 'Ignorado em',
    minWidth: 140,
    valueFormatter: (value: TIgnoredProductRow['ignoredAt']) =>
      value ? dayjs(value.toDate()).format('DD/MM/YYYY') : '—'
  }
]
