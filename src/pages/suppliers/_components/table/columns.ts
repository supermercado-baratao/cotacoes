import type { GridColDef } from '@mui/x-data-grid'

import type { TSupplier } from '@/models'
import { formatCNPJ, formatPhone } from '@/utils'

export const columns: GridColDef<TSupplier>[] = [
  {
    field: 'legalName',
    headerName: 'Razão Social',
    minWidth: 200,
    flex: 1,
    valueFormatter: (value: string) => value.toUpperCase()
  },
  {
    field: 'tradeName',
    headerName: 'Nome Fantasia',
    minWidth: 180,
    flex: 1,
    valueFormatter: (value: string) => value.toUpperCase()
  },
  {
    field: 'cnpj',
    headerName: 'CNPJ',
    width: 160,
    valueFormatter: (value: string) => formatCNPJ(value)
  },
  {
    field: 'email',
    headerName: 'E-mail',
    minWidth: 180,
    flex: 1
  },
  {
    field: 'phone',
    headerName: 'Telefone',
    width: 150,
    valueFormatter: (value: string) => formatPhone(value)
  }
]
