import { Cancel, CheckCircle } from '@mui/icons-material'
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { ptBR } from '@mui/x-data-grid/locales'
import { useMemo, useState } from 'react'

import type { TInvoiceItemMatchStatus, TProduct } from '@/models'
import { formatCurrency, formatNumericValue, matchesSearch } from '@/utils'

import type { TInvoiceItemRow } from './use-invoice-detail-handler'

const matchStatusConfig: Record<
  TInvoiceItemMatchStatus,
  {
    label: string
    color: 'success' | 'error' | 'warning' | 'info'
    tooltip?: string
  }
> = {
  matched: { label: 'Identificado', color: 'success' },
  unmatched_product: { label: 'Sem produto', color: 'error' },
  unmatched_order: { label: 'Sem pedido', color: 'warning' },
  manual: {
    label: 'Manual',
    color: 'info',
    tooltip: 'Identificado por similaridade de descrição — confirme ou corrija'
  }
}

type TProps = {
  items: TInvoiceItemRow[]
  products: TProduct[]
  handleConfirmMatch: (itemNumber: number) => void
  handleRejectMatch: (itemNumber: number) => void
  handleAssignProduct: (itemNumber: number, productId: string) => void
}

export const ItemsTable = ({
  items,
  products,
  handleConfirmMatch,
  handleRejectMatch,
  handleAssignProduct
}: TProps) => {
  const [dialogItemNumber, setDialogItemNumber] = useState<number | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<TProduct | null>(null)

  const dialogItem =
    items.find((i) => i.itemNumber === dialogItemNumber) ?? null

  const handleDialogConfirm = () => {
    if (dialogItemNumber !== null && selectedProduct) {
      handleAssignProduct(dialogItemNumber, selectedProduct.id)
    }
    setDialogItemNumber(null)
    setSelectedProduct(null)
  }

  const handleDialogClose = () => {
    setDialogItemNumber(null)
    setSelectedProduct(null)
  }

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
          const chip = (
            <Chip label={config.label} color={config.color} size="small" />
          )
          return config.tooltip ? (
            <Tooltip title={config.tooltip}>{chip}</Tooltip>
          ) : (
            chip
          )
        }
      },
      {
        field: 'actions',
        headerName: 'Ações',
        width: 120,
        sortable: false,
        renderCell: (params) => {
          const { matchStatus, itemNumber } = params.row
          if (matchStatus === 'manual') {
            return (
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                <Tooltip title="Confirmar correspondência">
                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => handleConfirmMatch(itemNumber)}
                  >
                    <CheckCircle fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Rejeitar e desatribuir produto">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRejectMatch(itemNumber)}
                  >
                    <Cancel fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )
          }
          if (
            matchStatus === 'unmatched_product' ||
            matchStatus === 'unmatched_order'
          ) {
            return (
              <Button
                size="small"
                onClick={() => setDialogItemNumber(itemNumber)}
              >
                Atribuir
              </Button>
            )
          }
          return null
        }
      }
    ],
    [handleConfirmMatch, handleRejectMatch]
  )

  return (
    <>
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

      <Dialog
        open={dialogItemNumber !== null}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Atribuir produto</DialogTitle>
        <DialogContent>
          {dialogItem && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Item NF: {dialogItem.description.toUpperCase()}
              {dialogItem.supplierProductCode && (
                <> — Cód. fornecedor: {dialogItem.supplierProductCode}</>
              )}
            </Typography>
          )}
          <Autocomplete
            options={products}
            getOptionLabel={(p) => `${p.description.toUpperCase()} (${p.id})`}
            filterOptions={(opts, { inputValue }) =>
              opts.filter((p) =>
                matchesSearch(
                  inputValue,
                  p.description,
                  p.id,
                  p.barcodes.join(' ')
                )
              )
            }
            value={selectedProduct}
            onChange={(_, p) => setSelectedProduct(p)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Produto"
                placeholder="Busque por descrição, código VR ou código de barras"
                size="small"
                autoFocus
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleDialogConfirm}
            disabled={!selectedProduct}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
