import {
  ArrowBack,
  Block,
  CheckCircle,
  Delete,
  Link as LinkIcon,
  Warning
} from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Tooltip,
  Typography
} from '@mui/material'
import dayjs from 'dayjs'
import { useState } from 'react'

import { DeleteDialog } from '@/components/ui/dialog'
import { SearchInput } from '@/components/ui/search-input'
import type { TInvoiceVerificationStatus } from '@/models/invoice-model/types'
import { formatCNPJ, formatCurrency } from '@/utils/formatters'

import { EditOrderDialog } from './edit-order-dialog'
import { ItemsTable } from './items-table'
import { LinkOrdersDialog } from './link-orders-dialog'
import { PackCorrectionDialog } from './pack-correction-dialog'
import * as S from './style'
import {
  type TInvoiceItemRow,
  useInvoiceDetailHandler
} from './use-invoice-detail-handler'

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

export const InvoiceDetail = () => {
  const {
    invoice,
    isFetching,
    itemsWithDivergences,
    search,
    setSearch,
    quotes,
    selectedQuoteId,
    selectedQuote,
    orderMap,
    supplier,
    hasUnlinkedItems,
    isSupplierIgnored,
    itemToDelete,
    packCorrectionRow,
    handleQuoteChange,
    handleApprove,
    handleMarkDivergent,
    handleIgnoreSupplier,
    handleDelete,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm,
    handlePackCorrectionDialogOpen,
    handlePackCorrectionDialogClose,
    handleBack
  } = useInvoiceDetailHandler()

  const [isLinkOrdersOpen, setIsLinkOrdersOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<TInvoiceItemRow | null>(null)

  if (isFetching || !invoice) return null

  const editingOrder = editingRow?.orderId
    ? (orderMap.get(editingRow.orderId) ?? null)
    : null

  const summary = {
    total: itemsWithDivergences.length,
    registered: itemsWithDivergences.filter((item) => item.productId !== null)
      .length,
    unmatchedProduct: itemsWithDivergences.filter(
      (item) => item.productId === null
    ).length,
    unmatchedOrder: itemsWithDivergences.filter((item) => item.orderId === null)
      .length
  }

  return (
    <Box>
      <Box sx={S.HeaderRow}>
        <IconButton onClick={handleBack} size="small" aria-label="Voltar">
          <ArrowBack />
        </IconButton>
        <Typography component="h1" variant="h5" sx={{ flex: 1 }}>
          NF nº {invoice.number} — Série {invoice.series}
        </Typography>
        <Chip
          label={statusLabel[invoice.verificationStatus]}
          color={statusColor[invoice.verificationStatus]}
          size="small"
        />
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Fornecedor
            </Typography>
            <Typography>{invoice.supplierName.toUpperCase()}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">
              CNPJ
            </Typography>
            <Typography>{formatCNPJ(invoice.supplierCnpj)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Emissão
            </Typography>
            <Typography>
              {dayjs(invoice.emissionDate).format('DD/MM/YYYY')}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Total NF
            </Typography>
            <Typography>{formatCurrency(invoice.totalValue)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Cotação
            </Typography>
            <FormControl size="small" fullWidth>
              <Select
                displayEmpty
                value={selectedQuoteId ?? ''}
                onChange={(event) =>
                  handleQuoteChange(event.target.value || null)
                }
              >
                <MenuItem value="">
                  <em>Nenhuma</em>
                </MenuItem>
                {quotes.map((quote) => (
                  <MenuItem key={quote.id} value={quote.id}>
                    {dayjs(quote.date).format('DD/MM/YYYY')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 12 }}>
            <Typography variant="body2" color="text.secondary">
              Chave de Acesso
            </Typography>
            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
              {invoice.accessKey}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={S.ItemsHeader}>
          <Box sx={S.ItemsHeaderLeft}>
            <Typography variant="h6">
              Itens da nota ({summary.total})
            </Typography>
            <SearchInput
              placeholder="Buscar por produto, código ou descrição..."
              value={search}
              onValueChange={setSearch}
            />
          </Box>
          <Tooltip
            title={
              selectedQuote
                ? summary.unmatchedOrder === 0
                  ? 'Todos os itens já estão vinculados a um pedido'
                  : ''
                : 'Selecione uma cotação para vincular pedidos'
            }
          >
            <span>
              <Button
                size="small"
                variant="outlined"
                startIcon={<LinkIcon />}
                disabled={!selectedQuote || summary.unmatchedOrder === 0}
                onClick={() => setIsLinkOrdersOpen(true)}
              >
                Vincular pedidos
              </Button>
            </span>
          </Tooltip>
        </Box>
        <Box sx={S.ChipRow}>
          <Chip
            label={`${summary.registered} cadastrados`}
            color="success"
            size="small"
          />
          {summary.unmatchedProduct > 0 && (
            <Chip
              label={`${summary.unmatchedProduct} sem cadastro`}
              color="error"
              size="small"
            />
          )}
          {summary.unmatchedOrder > 0 && (
            <Chip
              label={`${summary.unmatchedOrder} sem pedido`}
              color="warning"
              size="small"
            />
          )}
        </Box>
        <ItemsTable
          items={itemsWithDivergences}
          hasSupplier={!!supplier}
          handleEditOrder={setEditingRow}
          handlePackCorrectionDialogOpen={handlePackCorrectionDialogOpen}
        />
      </Paper>

      <Box sx={S.Actions}>
        <Tooltip
          title={
            isSupplierIgnored ? 'Fornecedor já ignorado permanentemente' : ''
          }
        >
          <span>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<Block />}
              onClick={handleIgnoreSupplier}
              disabled={isSupplierIgnored}
            >
              {isSupplierIgnored ? 'Fornecedor ignorado' : 'Ignorar fornecedor'}
            </Button>
          </span>
        </Tooltip>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Delete />}
          onClick={() => handleDelete(invoice)}
        >
          Excluir nota
        </Button>
        <Button
          variant="outlined"
          color="warning"
          startIcon={<Warning />}
          onClick={handleMarkDivergent}
          disabled={invoice.verificationStatus === 'divergent'}
        >
          Marcar como divergente
        </Button>
        <Tooltip
          title={
            hasUnlinkedItems && invoice.verificationStatus !== 'approved'
              ? 'Todos os itens precisam estar vinculados a um pedido para aprovar a nota'
              : ''
          }
        >
          <span>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={handleApprove}
              disabled={
                invoice.verificationStatus === 'approved' || hasUnlinkedItems
              }
            >
              Aprovar nota
            </Button>
          </span>
        </Tooltip>
      </Box>

      <DeleteDialog
        open={!!itemToDelete}
        title="Excluir Nota"
        item={`NF nº ${itemToDelete?.number ?? ''}`}
        handleConfirm={handleDeleteDialogConfirm}
        handleClose={handleDeleteDialogClose}
      />

      <LinkOrdersDialog
        isOpened={isLinkOrdersOpen}
        invoice={invoice}
        quote={selectedQuote}
        handleClose={() => setIsLinkOrdersOpen(false)}
      />

      <PackCorrectionDialog
        row={packCorrectionRow}
        supplier={supplier}
        handleClose={handlePackCorrectionDialogClose}
      />

      {selectedQuote && editingRow && editingOrder && (
        <EditOrderDialog
          key={editingOrder.id}
          invoice={invoice}
          quote={selectedQuote}
          itemNumber={editingRow.itemNumber}
          order={editingOrder}
          handleClose={() => setEditingRow(null)}
        />
      )}
    </Box>
  )
}
