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
    field: 'isSupplierRegistered',
    headerName: 'Cadastro',
    width: 150,
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
    field: 'items',
    headerName: 'Pendências',
    width: 110,
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
