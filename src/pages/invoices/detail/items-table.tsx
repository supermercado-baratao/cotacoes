import { Chip, Typography } from '@mui/material'
import type { GridColDef } from '@mui/x-data-grid'
import { useMemo } from 'react'

import { Table as _Table } from '@/components'
import type { TInvoiceItemMatchStatus } from '@/models'
import { formatCurrency, formatNumericValue } from '@/utils'

import type { TInvoiceItemRow } from './use-invoice-detail-handler'

const matchStatusConfig: Record<
  TInvoiceItemMatchStatus,
  { label: string; color: 'success' | 'error' | 'warning' }
> = {
  matched: { label: 'Identificado', color: 'success' },
  unmatched_product: { label: 'Sem produto', color: 'error' },
  unmatched_order: { label: 'Sem pedido', color: 'warning' }
}

type TProps = {
  items: TInvoiceItemRow[]
}

export const ItemsTable = ({ items }: TProps) => {
  const columns = useMemo<GridColDef<TInvoiceItemRow>[]>(
    () => [
      { field: 'itemNumber', headerName: 'Nº' },
      {
        field: 'description',
        headerName: 'Descrição NF',
        flex: 1,
        minWidth: 200,
        valueFormatter: (value: string) => value.toUpperCase()
      },
      { field: 'barcode', headerName: 'Cód. Barras' },
      { field: 'packageBarcode', headerName: 'Cód. Embalagem' },
      { field: 'unit', headerName: 'UN' },
      {
        field: 'quantity',
        headerName: 'Qtd NF',
        valueFormatter: (value: number) => formatNumericValue(value)
      },
      {
        field: 'unitPrice',
        headerName: 'Preço NF',
        valueFormatter: (value: number) => formatCurrency(value)
      },
      {
        field: 'productDescription',
        headerName: 'Produto',
        renderCell: (params) =>
          params.value ? (
            <Typography variant="body2">
              {params.value.toUpperCase()}
            </Typography>
          ) : (
            <Typography variant="body2" color="error.main">
              Não cadastrado
            </Typography>
          )
      },
      {
        field: 'orderQuantity',
        headerName: 'Qtd Pedido',
        renderCell: (params) =>
          params.value !== null ? (
            <Typography variant="body2">
              {formatNumericValue(params.value)}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.disabled">
              —
            </Typography>
          )
      },
      {
        field: 'orderPrice',
        headerName: 'Preço Pedido',
        renderCell: (params) =>
          params.value !== null ? (
            <Typography variant="body2">
              {formatCurrency(params.value)}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.disabled">
              —
            </Typography>
          )
      },
      {
        field: 'priceDivergence',
        headerName: 'Dif. Preço',
        renderCell: (params) => {
          if (params.value === null)
            return (
              <Typography variant="body2" color="text.disabled">
                —
              </Typography>
            )
          const diff = params.value as number
          if (diff === 0)
            return <Typography variant="body2">R$ 0,00</Typography>
          return (
            <Typography
              variant="body2"
              color={diff > 0 ? 'error.main' : 'warning.main'}
            >
              {diff > 0 ? '+' : ''}
              {formatCurrency(diff)}
            </Typography>
          )
        }
      },
      {
        field: 'quantityDivergence',
        headerName: 'Dif. Qtd',
        renderCell: (params) => {
          if (params.value === null)
            return (
              <Typography variant="body2" color="text.disabled">
                —
              </Typography>
            )
          const diff = params.value as number
          if (diff === 0) return <Typography variant="body2">0</Typography>
          return (
            <Typography
              variant="body2"
              color={diff > 0 ? 'error.main' : 'warning.main'}
            >
              {diff > 0 ? '+' : ''}
              {formatNumericValue(diff)}
            </Typography>
          )
        }
      },
      {
        field: 'matchStatus',
        headerName: 'Status',
        renderCell: (params) => {
          const config =
            matchStatusConfig[params.value as TInvoiceItemMatchStatus]
          return <Chip label={config.label} color={config.color} size="small" />
        }
      }
    ],
    []
  )

  return (
    <_Table
      columns={columns}
      items={items}
      getRowId={(row) => row.itemNumber}
    />
  )
}
