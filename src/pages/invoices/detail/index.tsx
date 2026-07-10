import { ArrowBack, CheckCircle, Delete, Warning } from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Paper,
  Typography
} from '@mui/material'
import dayjs from 'dayjs'

import { DeleteDialog } from '@/components'
import type { TInvoiceVerificationStatus } from '@/models'
import { formatCNPJ, formatCurrency } from '@/utils'

import { ItemsTable } from './items-table'
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
    itemToDelete,
    handleApprove,
    handleMarkDivergent,
    handleDelete,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm,
    handleBack
  } = useInvoiceDetailHandler()

  if (isFetching || !invoice) return null

  const summary = {
    total: itemsWithDivergences.length,
    matched: itemsWithDivergences.filter((i) => i.matchStatus === 'matched')
      .length,
    unmatchedProduct: itemsWithDivergences.filter(
      (i) => i.matchStatus === 'unmatched_product'
    ).length,
    unmatchedOrder: itemsWithDivergences.filter(
      (i) => i.matchStatus === 'unmatched_order'
    ).length,
    withDivergence: itemsWithDivergences.filter(
      (i) => i.priceDivergence !== null && i.priceDivergence !== 0
    ).length,
    totalDivergence: itemsWithDivergences.reduce(
      (acc, i) =>
        i.priceDivergence !== null && i.priceDivergence !== 0
          ? acc + i.priceDivergence * i.quantity
          : acc,
      0
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
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
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Itens da nota ({summary.total})
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip
            label={`${summary.matched}/${summary.total} identificados`}
            color="success"
            size="small"
          />
          {summary.unmatchedProduct > 0 && (
            <Chip
              label={`${summary.unmatchedProduct} sem produto`}
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
          {summary.withDivergence > 0 && (
            <Chip
              label={`${summary.withDivergence} divergência${summary.withDivergence !== 1 ? 's' : ''} de preço (${formatCurrency(summary.totalDivergence)})`}
              color={summary.totalDivergence > 0 ? 'error' : 'warning'}
              size="small"
            />
          )}
        </Box>
        <ItemsTable items={itemsWithDivergences} />
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
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
    </Box>
  )
}
