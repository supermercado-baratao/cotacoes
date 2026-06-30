import { ExpandLess, ExpandMore, ReceiptLong } from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  Link,
  Typography
} from '@mui/material'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

import type { TInvoice, TInvoiceItem, TProduct, TQuoteItem } from '@/models'
import { useAppStore } from '@/stores'
import { formatCurrency, formatNumericValue } from '@/utils'

import {
  getInvoiceSuggestions,
  isLikelyMatch,
  type TInvoiceSuggestion
} from './nf-suggestions-utils'

type TNfSuggestionsProps = {
  quoteItem: TQuoteItem
  onSelectItem: (invoice: TInvoice, itemNumber: number) => void
}

const InvoiceGroup = ({
  suggestion,
  quoteItem,
  productMap,
  onSelectItem
}: {
  suggestion: TInvoiceSuggestion
  quoteItem: TQuoteItem
  productMap: Map<string, TProduct>
  onSelectItem: (invoice: TInvoice, item: TInvoiceItem) => void
}) => {
  const { invoice, unlinkedItems } = suggestion

  const sortedItems = useMemo(() => {
    const likely = unlinkedItems.filter((i) =>
      isLikelyMatch(i, quoteItem, productMap)
    )
    const others = unlinkedItems.filter(
      (i) => !isLikelyMatch(i, quoteItem, productMap)
    )
    return [...likely, ...others]
  }, [unlinkedItems, quoteItem, productMap])

  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}
      >
        NF {invoice.number} · {invoice.supplierName.toUpperCase()} ·{' '}
        {dayjs(invoice.emissionDate).format('DD/MM/YYYY')}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {sortedItems.map((item) => {
          const likely = isLikelyMatch(item, quoteItem, productMap)
          return (
            <Box
              key={item.itemNumber}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                px: 1.5,
                py: 0.75,
                borderRadius: 1,
                border: '1px solid',
                borderColor: likely ? 'success.main' : 'divider',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Typography variant="body2" noWrap>
                    {item.description.toUpperCase()}
                  </Typography>
                  {likely && (
                    <Chip
                      label="Provável"
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{
                        height: 16,
                        flexShrink: 0,
                        '& .MuiChip-label': { px: 0.75, fontSize: '0.625rem' }
                      }}
                    />
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {formatCurrency(item.unitPrice)} ·{' '}
                  {formatNumericValue(item.quantity)} {item.unit.toUpperCase()}
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                onClick={() => onSelectItem(invoice, item)}
              >
                Usar este
              </Button>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export const NfSuggestions = ({
  quoteItem,
  onSelectItem
}: TNfSuggestionsProps) => {
  const { invoices, products, quotes, quoteId } = useAppStore()
  const [otherOpen, setOtherOpen] = useState(false)

  const quote = useMemo(
    () => quotes?.find((q) => q.id === quoteId) ?? null,
    [quotes, quoteId]
  )

  const nextQuoteDate = useMemo((): string | null => {
    if (!quotes || !quote) return null
    const sorted = [...quotes].sort((a, b) => a.date.localeCompare(b.date))
    const idx = sorted.findIndex((q) => q.id === quote.id)
    return sorted[idx + 1]?.date ?? null
  }, [quotes, quote])

  const productMap = useMemo(
    () => new Map((products ?? []).map((p) => [p.id, p])),
    [products]
  )

  const suggestions = useMemo(() => {
    if (!invoices || !products || !quote) return null
    return getInvoiceSuggestions(
      quoteItem,
      invoices,
      products,
      quote,
      nextQuoteDate
    )
  }, [quoteItem, invoices, products, quote, nextQuoteDate])

  if (!suggestions) return null
  const { likely, other } = suggestions
  if (!likely.length && !other.length) return null

  const handleSelect = (invoice: TInvoice, item: TInvoiceItem) => {
    onSelectItem(invoice, item.itemNumber)
  }

  return (
    <>
      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          maxHeight: 360,
          overflowY: 'auto'
        }}
      >
        <Typography variant="subtitle2" color="text.secondary">
          Sugestões de NF
        </Typography>

        {likely.length > 0 ? (
          likely.map((s) => (
            <InvoiceGroup
              key={s.invoice.id}
              suggestion={s}
              quoteItem={quoteItem}
              productMap={productMap}
              onSelectItem={handleSelect}
            />
          ))
        ) : (
          <Typography variant="caption" color="text.disabled">
            Nenhuma nota com correspondência de família ou produto.
          </Typography>
        )}

        {other.length > 0 && (
          <Box>
            <Link
              component="button"
              variant="caption"
              color="text.secondary"
              onClick={() => setOtherOpen((v) => !v)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.25,
                textDecoration: 'none'
              }}
            >
              <ReceiptLong fontSize="inherit" sx={{ mr: 0.25 }} />
              Outras notas ({other.length})
              {otherOpen ? (
                <ExpandLess fontSize="inherit" />
              ) : (
                <ExpandMore fontSize="inherit" />
              )}
            </Link>
            <Collapse in={otherOpen}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  mt: 1
                }}
              >
                {other.map((s) => (
                  <InvoiceGroup
                    key={s.invoice.id}
                    suggestion={s}
                    quoteItem={quoteItem}
                    productMap={productMap}
                    onSelectItem={handleSelect}
                  />
                ))}
              </Box>
            </Collapse>
          </Box>
        )}
      </Box>
      <Divider />
    </>
  )
}
