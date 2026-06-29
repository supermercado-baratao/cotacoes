import { Chip, Typography } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { ptBR } from '@mui/x-data-grid/locales'
import { useMemo } from 'react'

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
      { field: 'itemNumber', headerName: 'Nº', width: 60 },
      {
        field: 'description',
        headerName: 'Descrição NF',
        flex: 1,
        minWidth: 200,
        valueFormatter: (value: string) => value.toUpperCase()
      },
      { field: 'barcode', headerName: 'Cód. Barras', width: 130 },
      { field: 'unit', headerName: 'UN', width: 70 },
      {
        field: 'quantity',
        headerName: 'Qtd NF',
        width: 90,
        valueFormatter: (value: number) => formatNumericValue(value)
      },
      {
        field: 'unitPrice',
        headerName: 'Preço NF',
        width: 120,
        valueFormatter: (value: number) => formatCurrency(value)
      },
      {
        field: 'productDescription',
        headerName: 'Produto',
        width: 200,
        renderCell: (params) =>
          params.value ? (
            <Typography variant="body2">
              {params.value.toUpperCase()}
            </Typography>
          ) : (
            <Typography variant="body2" color="error.main">
              Não identificado
            </Typography>
          )
      },
      {
        field: 'orderQuantity',
        headerName: 'Qtd Pedido',
        width: 110,
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
        width: 130,
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
        width: 120,
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
        width: 90,
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
        width: 140,
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
    <DataGrid
      columns={columns}
      rows={items}
      getRowId={(row) => row.itemNumber}
      pageSizeOptions={[25, 50, 100]}
      initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
      localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
      disableRowSelectionOnClick
      sx={{ textAlign: 'center' }}
    />
  )
}
