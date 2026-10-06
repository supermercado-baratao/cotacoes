import type { GridColDef } from '@mui/x-data-grid'
import dayjs from 'dayjs'
import type { Timestamp } from 'firebase/firestore'

import type { TIgnoredSupplier } from '@/models/ignored-supplier-model/types'
import { formatCNPJ } from '@/utils/formatters'

export const columns: GridColDef<TIgnoredSupplier>[] = [
  {
    field: 'name',
    headerName: 'Nome Fantasia',
    minWidth: 200,
    flex: 1,
    valueFormatter: (value: string) => value.toUpperCase()
  },
  {
    field: 'cnpj',
    headerName: 'CNPJ',
    valueFormatter: (value: string) => formatCNPJ(value)
  },
  {
    field: 'createdAt',
    headerName: 'Ignorado em',
    minWidth: 140,
    valueFormatter: (value: Timestamp) =>
      dayjs(value.toDate()).format('DD/MM/YYYY')
  }
]
