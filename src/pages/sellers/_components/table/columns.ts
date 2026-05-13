import type { GridColDef } from '@mui/x-data-grid'

import type { TSeller } from '@/models'
import { formatPhone } from '@/utils'

export const columns: GridColDef<TSeller>[] = [
  {
    field: 'name',
    headerName: 'Nome',
    minWidth: 200,
    flex: 1,
    valueFormatter: (value: string) => value.toUpperCase()
  },
  {
    field: 'phone',
    headerName: 'Telefone',
    minWidth: 200,
    flex: 1,
    valueFormatter: (value: string | null) => (value ? formatPhone(value) : '')
  }
]
