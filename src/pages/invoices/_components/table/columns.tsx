import { Chip } from '@mui/material'
import type { GridColDef } from '@mui/x-data-grid'
import dayjs from 'dayjs'

import type {
  TInvoice,
  TInvoiceOrigin,
  TInvoiceVerificationStatus
} from '@/models'
import { formatCurrency } from '@/utils'

const originLabel: Record<TInvoiceOrigin, string> = {
  issued: 'Emitida',
  posted: 'Lançada'
}

const originColor: Record<TInvoiceOrigin, 'warning' | 'success'> = {
  issued: 'warning',
  posted: 'success'
}

const statusLabel: Record<TInvoiceVerificationStatus, string> = {
  pending: 'Pendente',
  approved: 'Aprovada',
  divergent: 'Divergente'
}

const statusColor: Record<
  TInvoiceVerificationStatus,
  'default' | 'success' | 'error'
> = {
  pending: 'default',
  approved: 'success',
  divergent: 'error'
}

export const columns: GridColDef<TInvoice>[] = [
  {
    field: 'number',
    headerName: 'Nº NF',
    width: 90
  },
  {
    field: 'series',
    headerName: 'Série',
    width: 70
  },
  {
    field: 'supplierName',
    headerName: 'Fornecedor',
    flex: 1,
    minWidth: 200,
    valueFormatter: (value: string) => value.toUpperCase()
  },
  {
    field: 'emissionDate',
    headerName: 'Emissão',
    width: 110,
    valueFormatter: (value: string) => dayjs(value).format('DD/MM/YYYY')
  },
  {
    field: 'totalValue',
    headerName: 'Total NF',
    width: 130,
    valueFormatter: (value: number) => formatCurrency(value)
  },
  {
    field: 'origin',
    headerName: 'Tipo',
    width: 110,
    renderCell: (params) => (
      <Chip
        label={originLabel[params.value as TInvoiceOrigin]}
        color={originColor[params.value as TInvoiceOrigin]}
        size="small"
      />
    )
  },
  {
    field: 'verificationStatus',
    headerName: 'Status',
    width: 130,
    renderCell: (params) => (
      <Chip
        label={statusLabel[params.value as TInvoiceVerificationStatus]}
        color={statusColor[params.value as TInvoiceVerificationStatus]}
        size="small"
      />
    )
  }
]
