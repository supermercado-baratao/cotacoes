import { Edit, Inventory2 } from '@mui/icons-material'
import { Box, Chip, IconButton, Tooltip } from '@mui/material'
import { GridActionsCellItem, type GridColDef } from '@mui/x-data-grid'
import { useMemo } from 'react'

import { Table as _Table } from '@/components/blocks/table'
import type { TInvoiceItemMatchStatus } from '@/models/invoice/types'
import { formatCurrency, formatNumericValue } from '@/utils/formatters'
import { marginStatusConfig, type TMarginStatus } from '@/utils/margin'

import * as S from './style'
import type { TInvoiceItemRow } from './use-invoice-detail-handler'

const matchStatusConfig: Record<
  TInvoiceItemMatchStatus,
  { label: string; color: 'success' | 'error' | 'warning' }
> = {
  matched: { label: 'Identificado', color: 'success' },
  unmatched_product: { label: 'Sem produto', color: 'error' },
  unmatched_order: { label: 'Sem pedido', color: 'warning' }
}

const getPackCorrectionTooltip = (
  hasSupplier: boolean,
  row: TInvoiceItemRow
): string => {
  if (!hasSupplier) {
    return 'Cadastre o fornecedor da nota para corrigir a Qtd. Embalagem'
  }
  if (!row.productId) {
    return 'Vincule o item a um produto para corrigir a Qtd. Embalagem'
  }
  return 'Corrigir Qtd. Embalagem'
}

type TProps = {
  items: TInvoiceItemRow[]
  hasSupplier: boolean
  handleEditOrder: (row: TInvoiceItemRow) => void
  handlePackCorrectionDialogOpen: (row: TInvoiceItemRow) => void
}

export const ItemsTable = ({
  items,
  hasSupplier,
  handleEditOrder,
  handlePackCorrectionDialogOpen
}: TProps) => {
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
          value == null ? '—' : formatNumericValue(value)
      },
      {
        field: 'correctedPackQuantity',
        headerName: 'Qtd. Emb. Corrigida',
        minWidth: 150,
        renderCell: (params) => (
          <Box sx={S.PackCorrectionCell}>
            {params.value == null ? '—' : formatNumericValue(params.value)}
            <Tooltip title={getPackCorrectionTooltip(hasSupplier, params.row)}>
              <span>
                <IconButton
                  size="small"
                  tabIndex={params.tabIndex}
                  disabled={!hasSupplier || !params.row.productId}
                  aria-label={`Corrigir Qtd. Embalagem de ${params.row.description}`}
                  onClick={() => handlePackCorrectionDialogOpen(params.row)}
                >
                  <Inventory2 fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        )
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
          value == null ? '—' : formatNumericValue(value)
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
          value == null ? '—' : formatCurrency(value)
      },
      {
        field: 'totalPrice',
        headerName: 'Valor Total',
        valueFormatter: (value: number) => formatCurrency(value)
      },
      {
        field: 'unitCostWithTax',
        headerName: 'Custo Unit. c/ Imposto',
        minWidth: 160,
        valueFormatter: (value: number | null) =>
          value == null ? '—' : formatCurrency(value)
      },
      {
        field: 'salePrice',
        headerName: 'Preço de Venda',
        valueFormatter: (value: number | null) =>
          value == null ? '—' : formatCurrency(value)
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
    [hasSupplier, handlePackCorrectionDialogOpen]
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
