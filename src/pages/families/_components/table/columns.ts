import type { GridColDef } from '@mui/x-data-grid'

import type { TFamily } from '@/models'

export const columns: GridColDef<TFamily>[] = [
  {
    field: 'id',
    headerName: 'Cód. VR',
    width: 90
  },
  {
    field: 'description',
    headerName: 'Descrição',
    minWidth: 280,
    flex: 1,
    valueFormatter: (value: string) => value.toUpperCase()
  }
]
