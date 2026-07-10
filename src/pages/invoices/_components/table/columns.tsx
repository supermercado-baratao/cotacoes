import { CheckCircle, Warning } from '@mui/icons-material'
import { Chip } from '@mui/material'
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

const renderRatioChip = (count: number, total: number) => (
  <Chip
    label={`${count}/${total}`}
    color={count === total ? 'success' : count === 0 ? 'error' : 'warning'}
    size="small"
  />
)

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
    headerName: 'Cadastro dos Itens',
    valueGetter: (value: TInvoiceItem[]) =>
      value.filter((i) => i.productId !== null).length,
    renderCell: (params) =>
      renderRatioChip(params.value as number, params.row.items.length)
  },
  {
    field: 'linkedOrders',
    headerName: 'Pedidos',
    valueGetter: (_value, row) =>
      row.items.filter((i) => i.orderId !== null).length,
    renderCell: (params) =>
      renderRatioChip(params.value as number, params.row.items.length)
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
