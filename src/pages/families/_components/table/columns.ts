import type { GridColDef } from '@mui/x-data-grid'

import type { TFamily } from '@/models/family/types'

export const columns: GridColDef<TFamily>[] = [
  {
    field: 'id',
    headerName: 'Cód. VR'
  },
  {
    field: 'description',
    headerName: 'Descrição',
    minWidth: 280,
    flex: 1,
    valueFormatter: (value: string) => value.toUpperCase()
  }
]
