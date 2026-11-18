import type { GridColDef } from '@mui/x-data-grid'

import type { TDepartment } from '@/models/department/types'

export const columns: GridColDef<TDepartment>[] = [
  {
    field: 'description',
    headerName: 'Descrição',
    minWidth: 280,
    flex: 1,
    valueFormatter: (value: string) => value.toUpperCase()
  }
]
