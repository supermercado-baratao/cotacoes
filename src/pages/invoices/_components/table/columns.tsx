import { CheckCircle, Warning } from '@mui/icons-material'
import { Chip, Typography } from '@mui/material'
import type { GridColDef } from '@mui/x-data-grid'
import dayjs from 'dayjs'

import type {
  TInvoice,
  TInvoiceItem,
  TInvoiceVerificationStatus
} from '@/models'
import { formatCurrency } from '@/utils'

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

export type TInvoiceRow = TInvoice & { isSupplierRegistered: boolean }

export const columns: GridColDef<TInvoiceRow>[] = [
  {
    field: 'number',
    headerName: 'Nº NF'
  },
  {
    field: 'series',
    headerName: 'Série'
  },
  {
    field: 'supplierName',
    headerName: 'Fornecedor',
    flex: 1,
    minWidth: 200,
    valueFormatter: (value: string) => value.toUpperCase()
  },
  {
    field: 'isSupplierRegistered',
    headerName: 'Cadastro',
    renderCell: (params) =>
      params.value ? (
        <Chip
          icon={<CheckCircle />}
          label="Cadastrado"
          color="success"
          size="small"
          variant="outlined"
        />
      ) : (
        <Chip
          icon={<Warning />}
          label="Não cadastrado"
          color="warning"
          size="small"
        />
      )
  },
  {
    field: 'emissionDate',
    headerName: 'Emissão',
    valueFormatter: (value: string) => dayjs(value).format('DD/MM/YYYY')
  },
  {
    field: 'totalValue',
    headerName: 'Total NF',
    valueFormatter: (value: number) => formatCurrency(value)
  },
  {
    field: 'items',
    headerName: 'Pendências',
    valueGetter: (value: TInvoiceItem[]) =>
      value.filter((i) => i.matchStatus === 'unmatched_product').length,
    renderCell: (params) => {
      const count = params.value as number
      const total = params.row.items.length
      if (count === 0)
        return (
          <Typography variant="body2" color="text.disabled">
            —
          </Typography>
        )
      return <Chip label={`${count}/${total}`} color="error" size="small" />
    }
  },
  {
    field: 'verificationStatus',
    headerName: 'Status',
    renderCell: (params) => (
      <Chip
        label={statusLabel[params.value as TInvoiceVerificationStatus]}
        color={statusColor[params.value as TInvoiceVerificationStatus]}
        size="small"
      />
    )
  }
]
