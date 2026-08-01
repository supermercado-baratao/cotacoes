import {
  ArrowBack,
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

import { DeleteDialog } from '@/components'
import type { TInvoiceVerificationStatus } from '@/models'
import { formatCNPJ, formatCurrency } from '@/utils'

import { ItemsTable } from './items-table'
import { LinkOrdersDialog } from './link-orders-dialog'
import * as S from './style'
import { useInvoiceDetailHandler } from './use-invoice-detail-handler'

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
    quotes,
    selectedQuoteId,
    selectedQuote,
    itemToDelete,
    handleQuoteChange,
    handleApprove,
    handleMarkDivergent,
    handleDelete,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm,
    handleBack
  } = useInvoiceDetailHandler()

  const [isLinkOrdersOpen, setIsLinkOrdersOpen] = useState(false)

  if (isFetching || !invoice) return null

  const summary = {
    total: itemsWithDivergences.length,
    registered: itemsWithDivergences.filter((i) => i.productId !== null).length,
    unmatchedProduct: itemsWithDivergences.filter((i) => i.productId === null)
      .length,
    unmatchedOrder: itemsWithDivergences.filter((i) => i.orderId === null)
      .length
  }

  return (
    <Box>
      <Box sx={S.HeaderRow}>
        <IconButton onClick={handleBack} size="small">
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
                onChange={(e) => handleQuoteChange(e.target.value || null)}
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
          <Typography variant="h6">Itens da nota ({summary.total})</Typography>
          <Tooltip
            title={
              !selectedQuote
                ? 'Selecione uma cotação para vincular pedidos'
                : summary.unmatchedOrder === 0
                  ? 'Todos os itens já estão vinculados a um pedido'
                  : ''
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
        <ItemsTable items={itemsWithDivergences} />
      </Paper>

      <Box sx={S.Actions}>
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
        <Button
          variant="contained"
          color="success"
          startIcon={<CheckCircle />}
          onClick={handleApprove}
          disabled={invoice.verificationStatus === 'approved'}
        >
          Aprovar nota
        </Button>
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
    </Box>
  )
}
