import type { GridColDef } from '@mui/x-data-grid'

import type { TSupplier } from '@/models/supplier/types'
import { formatCNPJ, formatPhone } from '@/utils/formatters'

export const columns: GridColDef<TSupplier>[] = [
  {
    field: 'id',
    headerName: 'Cód. VR'
  },
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
    valueFormatter: (value: string) => formatCNPJ(value)
  },
  {
    field: 'phone',
    headerName: 'Telefone',
    valueFormatter: (value: string | null) => (value ? formatPhone(value) : '—')
  },
  {
    field: 'email',
    headerName: 'E-mail',
    minWidth: 180,
    flex: 1,
    valueFormatter: (value: string | null) => value ?? '—'
  },
  {
    field: 'vrCreatedAt',
    headerName: 'Cadastro VR',
    valueFormatter: (value: string | null) =>
      value ? new Date(value).toLocaleDateString('pt-BR') : '—'
  }
]
