import { Add } from '@mui/icons-material'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'

import { FamilyForm } from '@/components/blocks/family-form'
import { OrderForm } from '@/components/blocks/order-form'
import { ProductForm } from '@/components/blocks/product-form'
import { Modal } from '@/components/ui/modal'
import type { TInvoice } from '@/models/invoice-model/types'
import type { TProduct } from '@/models/product-model/types'
import type { TQuote } from '@/models/quote-model/types'
import { formatCurrency, formatNumericValue } from '@/utils/formatters'
import { matchesSearch } from '@/utils/search'

import { AddQuoteItemDialog } from './add-quote-item-dialog'
import { BatchConfirmDialog } from './batch-confirm-dialog'
import {
  ROWS_PER_PAGE,
  useLinkOrdersDialogHandler
} from './use-link-orders-dialog-handler'

const NEW_ITEM_VALUE = '__new_item__'

type TLinkOrdersDialogProps = {
  isOpened: boolean
  invoice: TInvoice
  quote: TQuote | null
  handleClose: () => void
}

export const LinkOrdersDialog = ({
  isOpened,
  invoice,
  quote,
  handleClose
}: TLinkOrdersDialogProps) => {
  const {
    supplier,
    products,
    rows,
    pagedRows,
    page,
    pageCount,
    setPage,
    selectedCount,
    handleRowQuoteItemChange,
    handleOpenAddQuoteItem,
    addQuoteItemDraft,
    handleAddQuoteItemDialogClose,
    handleConfirmAddQuoteItem,
    handleRowProductChange,
    handleQuickCreateProduct,
    quickCreateDraft,
    isQuickCreateOpen,
    handleQuickCreateClose,
    handleProductCreated,
    quickCreateFamily,
    setQuickCreateFamily,
    handleConfirm,
    currentQueueItem,
    currentQuoteItem,
    advanceQueue
  } = useLinkOrdersDialogHandler(isOpened, invoice, quote, handleClose)

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  )

  const quoteItemOptions = useMemo(
    () =>
      quote
        ? quote.items.toSorted((a, b) =>
            a.description.localeCompare(b.description)
          )
        : [],
    [quote]
  )

  const [isContentReady, setIsContentReady] = useState(false)
  const [previousIsOpened, setPreviousIsOpened] = useState(isOpened)
  if (isOpened !== previousIsOpened) {
    setPreviousIsOpened(isOpened)
    if (!isOpened) setIsContentReady(false)
  }

  useEffect(() => {
    if (!isOpened) return
    const id = requestAnimationFrame(() => setIsContentReady(true))
    return () => cancelAnimationFrame(id)
  }, [isOpened])

  return (
    <>
      <Modal
        isOpened={isOpened}
        title="Vincular pedidos"
        maxWidth={1000}
        handleClose={handleClose}
      >
        {quote ? (
          <>
            {!supplier && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Fornecedor não cadastrado — não é possível criar pedidos para
                esta nota.
              </Alert>
            )}
            {rows.length === 0 ? (
              <Typography color="text.secondary">
                Nenhum item pendente de vínculo com pedido nesta nota.
              </Typography>
            ) : isContentReady ? (
              <>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Descrição NF</TableCell>
                      <TableCell align="right">Preço</TableCell>
                      <TableCell align="right">Qtd</TableCell>
                      <TableCell>Produto</TableCell>
                      <TableCell>Item da cotação</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedRows.map((row) => {
                      const { item, productId, quoteItemId } = row
                      return (
                        <TableRow key={item.itemNumber}>
                          <TableCell>
                            {item.description.toUpperCase()}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(item.unitPrice)}
                          </TableCell>
                          <TableCell align="right">
                            {formatNumericValue(item.quantity)}
                          </TableCell>
                          <TableCell>
                            {item.productId === null ? (
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Autocomplete
                                  size="small"
                                  sx={{ flex: 1, minWidth: 200 }}
                                  options={products}
                                  getOptionLabel={(p) => p.description}
                                  filterOptions={(options, { inputValue }) =>
                                    options.filter((option) =>
                                      matchesSearch(
                                        inputValue,
                                        option.description
                                      )
                                    )
                                  }
                                  isOptionEqualToValue={(o, v) => o.id === v.id}
                                  value={
                                    (productId && productMap.get(productId)) ||
                                    null
                                  }
                                  onChange={(_, selected: TProduct | null) =>
                                    handleRowProductChange(
                                      item.itemNumber,
                                      selected?.id ?? ''
                                    )
                                  }
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      placeholder="Produto"
                                    />
                                  )}
                                />
                                <Tooltip title="Novo Produto">
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() =>
                                      handleQuickCreateProduct(item)
                                    }
                                  >
                                    <Add fontSize="small" />
                                  </Button>
                                </Tooltip>
                              </Box>
                            ) : (
                              (productMap
                                .get(item.productId)
                                ?.description.toUpperCase() ?? '—')
                            )}
                          </TableCell>
                          <TableCell>
                            <Select
                              size="small"
                              fullWidth
                              displayEmpty
                              value={quoteItemId}
                              onChange={(event) => {
                                if (event.target.value === NEW_ITEM_VALUE) {
                                  handleOpenAddQuoteItem(row)
                                  return
                                }
                                handleRowQuoteItemChange(
                                  item.itemNumber,
                                  event.target.value
                                )
                              }}
                            >
                              <MenuItem value="">
                                <em>Não vincular</em>
                              </MenuItem>
                              {quoteItemOptions.map((quoteItem) => (
                                <MenuItem
                                  key={quoteItem.id}
                                  value={quoteItem.id}
                                >
                                  {quoteItem.description.toUpperCase()}
                                </MenuItem>
                              ))}
                              <MenuItem value={NEW_ITEM_VALUE}>
                                + Adicionar item à cotação
                              </MenuItem>
                            </Select>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                {pageCount > 1 && (
                  <TablePagination
                    component="div"
                    count={rows.length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={ROWS_PER_PAGE}
                    rowsPerPageOptions={[]}
                    labelDisplayedRows={({ from, to, count }) =>
                      `${from}–${to} de ${count}`
                    }
                  />
                )}
              </>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            )}
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              disabled={!supplier || selectedCount === 0}
              onClick={handleConfirm}
            >
              Confirmar ({selectedCount})
            </Button>
          </>
        ) : (
          <Typography color="text.secondary">
            Selecione uma cotação para esta nota antes de vincular os pedidos.
          </Typography>
        )}
      </Modal>
      <ProductForm
        isOpened={isQuickCreateOpen}
        product={null}
        draft={quickCreateDraft}
        setFormProduct={() => {}}
        handleClose={handleQuickCreateClose}
        setQuickCreateFamily={setQuickCreateFamily}
        onCreated={handleProductCreated}
      />
      <FamilyForm
        isOpened={quickCreateFamily}
        family={null}
        setFormFamily={() => {}}
        handleClose={() => setQuickCreateFamily(false)}
      />
      <AddQuoteItemDialog
        key={addQuoteItemDraft?.itemNumber ?? 'closed'}
        draft={addQuoteItemDraft}
        handleClose={handleAddQuoteItemDialogClose}
        handleConfirm={handleConfirmAddQuoteItem}
      />
      {quote && supplier && currentQueueItem?.type === 'batch' && (
        <BatchConfirmDialog
          key={currentQueueItem.group.rows[0].item.itemNumber}
          isOpened
          group={currentQueueItem.group}
          quoteItem={currentQuoteItem}
          invoice={invoice}
          quote={quote}
          supplier={supplier}
          handleClose={advanceQueue}
        />
      )}
      {quote && currentQueueItem?.type === 'individual' && (
        <OrderForm
          key={currentQueueItem.row.item.itemNumber}
          isOpened
          quoteItem={currentQuoteItem}
          order={null}
          setFormOrder={() => {}}
          invoiceRef={{
            invoice,
            itemNumber: currentQueueItem.row.item.itemNumber
          }}
          handleClose={advanceQueue}
        />
      )}
    </>
  )
}
