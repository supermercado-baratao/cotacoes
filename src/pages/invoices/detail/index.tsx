import { ArrowBack, CheckCircle, Warning } from '@mui/icons-material'
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography
} from '@mui/material'
import dayjs from 'dayjs'

import type {
  TInvoiceOrigin,
  TInvoiceVerificationStatus,
  TQuote
} from '@/models'
import { formatCNPJ, formatCurrency } from '@/utils'

import { ItemsTable } from './items-table'
import { useInvoiceDetailHandler } from './use-invoice-detail-handler'

const originLabel: Record<TInvoiceOrigin, string> = {
  issued: 'Emitida',
  posted: 'Lançada'
}

const originColor: Record<TInvoiceOrigin, 'warning' | 'success'> = {
  issued: 'warning',
  posted: 'success'
}

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

const getQuoteLabel = (quote: TQuote) =>
  `${dayjs(quote.date).format('DD/MM/YYYY')}${quote.observations ? ` — ${quote.observations}` : ''}`

export const InvoiceDetail = () => {
  const {
    invoice,
    isFetching,
    quotes,
    selectedQuoteId,
    handleQuoteChange,
    itemsWithDivergences,
    missingOrders,
    productMap,
    handleApprove,
    handleMarkDivergent,
    handleBack
  } = useInvoiceDetailHandler()

  if (isFetching || !invoice) return null

  const selectedQuote = quotes?.find((q) => q.id === selectedQuoteId) ?? null

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
          label={originLabel[invoice.origin]}
          color={originColor[invoice.origin]}
          size="small"
        />
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
              Chave de Acesso
            </Typography>
            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
              {invoice.accessKey}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Comparar com cotação
        </Typography>
        <Autocomplete
          options={quotes ?? []}
          getOptionLabel={getQuoteLabel}
          value={selectedQuote}
          onChange={(_, q) => handleQuoteChange(q?.id ?? null)}
          renderInput={(params) => (
            <TextField {...params} label="Cotação" size="small" />
          )}
          sx={{ maxWidth: 400 }}
        />
        {!invoice.supplierId && (
          <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
            Fornecedor não identificado no sistema — o matching de pedidos não
            será possível.
          </Typography>
        )}
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Itens da nota ({invoice.items.length})
        </Typography>
        <ItemsTable items={itemsWithDivergences} />
      </Paper>

      {missingOrders.length > 0 && (
        <Paper
          sx={{
            p: 2,
            mb: 3,
            border: '1px solid',
            borderColor: 'warning.main'
          }}
        >
          <Typography variant="h6" color="warning.main" sx={{ mb: 1 }}>
            Itens do pedido não faturados ({missingOrders.length})
          </Typography>
          <List dense>
            {missingOrders.map((order) => {
              const product = productMap.get(order.productId)
              return (
                <ListItem key={order.id} disableGutters>
                  <ListItemText
                    primary={
                      product?.description.toUpperCase() ?? order.productId
                    }
                    secondary={`Qtd: ${order.quantity} — Preço: ${formatCurrency(order.price)}`}
                  />
                </ListItem>
              )
            })}
          </List>
        </Paper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
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
    </Box>
  )
}
