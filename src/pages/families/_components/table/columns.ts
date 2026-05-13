import type { GridColDef } from '@mui/x-data-grid'

import type { TFamily } from '@/models'

export const columns: GridColDef<TFamily>[] = [
  {
    field: 'description',
    headerName: 'Descrição',
    minWidth: 280,
    flex: 1,
    valueFormatter: (value: string) => value.toUpperCase()
  },
  {
    field: 'productIds',
    headerName: 'Total de Produtos',
    width: 160,
    valueGetter: (_: never, row: TFamily) => row.productIds?.length ?? 0
  }
]
