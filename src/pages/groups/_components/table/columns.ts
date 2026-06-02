import type { GridColDef } from '@mui/x-data-grid'

import type { TGroup } from '@/models'

export const columns: GridColDef<TGroup>[] = [
  {
    field: 'description',
    headerName: 'Descrição',
    minWidth: 280,
    flex: 1,
    valueFormatter: (value: string) => value.toUpperCase()
  }
]
