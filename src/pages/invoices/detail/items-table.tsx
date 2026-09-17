import { Edit } from '@mui/icons-material'
import { Chip } from '@mui/material'
import { GridActionsCellItem, type GridColDef } from '@mui/x-data-grid'
import { useMemo } from 'react'

import { Table as _Table } from '@/components'
import type { TInvoiceItemMatchStatus } from '@/models'
import {
  formatCurrency,
  formatNumericValue,
  marginStatusConfig,
  type TMarginStatus
} from '@/utils'

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
  handleEditOrder: (row: TInvoiceItemRow) => void
}

export const ItemsTable = ({ items, handleEditOrder }: TProps) => {
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
      {
        field: 'barcode',
        headerName: 'Cód. Barras',
        renderCell: (params) =>
          params.value
            ? `${params.value}${
                params.row.calculatedBarcode === params.value
                  ? ' (calculado)'
                  : ''
              }`
            : '—'
      },
      { field: 'packageBarcode', headerName: 'Cód. Embalagem' },
      { field: 'unit', headerName: 'UN' },
      {
        field: 'orderPackingQuantity',
        headerName: 'Qtd. Embalagem',
        valueFormatter: (value: number | null) =>
          value != null ? formatNumericValue(value) : '—'
      },
      {
        field: 'quantity',
        headerName: 'Qtd NF',
        valueFormatter: (value: number) => formatNumericValue(value)
      },
      {
        field: 'tribUnit',
        headerName: 'UN Trib.',
        valueFormatter: (value: string | null) => value ?? '—'
      },
      {
        field: 'tribQuantity',
        headerName: 'Qtd Trib.',
        valueFormatter: (value: number | null) =>
          value != null ? formatNumericValue(value) : '—'
      },
      {
        field: 'orderPrice',
        headerName: 'Valor Unit.',
        valueGetter: (_value, row) => row.orderPrice ?? row.unitPrice,
        valueFormatter: (value: number) => formatCurrency(value)
      },
      {
        field: 'unitPrice',
        headerName: 'Valor Emb.',
        valueFormatter: (value: number) => formatCurrency(value)
      },
      {
        field: 'tribUnitPrice',
        headerName: 'Valor Unit. Trib.',
        valueFormatter: (value: number | null) =>
          value != null ? formatCurrency(value) : '—'
      },
      {
        field: 'totalPrice',
        headerName: 'Valor Total',
        valueFormatter: (value: number) => formatCurrency(value)
      },
      {
        field: 'salePrice',
        headerName: 'Preço de Venda',
        valueFormatter: (value: number | null) =>
          value != null ? formatCurrency(value) : '—'
      },
      {
        field: 'productDescription',
        headerName: 'Produto',
        renderCell: (params) =>
          params.value ? params.value.toUpperCase() : 'Não cadastrado'
      },
      {
        field: 'matchStatus',
        headerName: 'Status',
        renderCell: (params) => {
          const config =
            matchStatusConfig[params.value as TInvoiceItemMatchStatus]
          return <Chip label={config.label} color={config.color} size="small" />
        }
      },
      {
        field: 'marginStatus',
        headerName: 'Situação de Margem',
        minWidth: 160,
        renderCell: (params) => {
          const status = params.value as TMarginStatus | null
          if (!status) return '—'
          const config = marginStatusConfig[status]
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
      getExtraActions={(row) =>
        row.orderId
          ? [
              <GridActionsCellItem
                key="edit-order"
                icon={<Edit />}
                label="Editar pedido"
                onClick={() => handleEditOrder(row)}
              />
            ]
          : []
      }
    />
  )
}
