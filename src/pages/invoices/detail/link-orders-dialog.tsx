import { Add } from '@mui/icons-material'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'

import { FamilyForm, Modal, ProductForm } from '@/components'
import type { TInvoice, TProduct, TQuote } from '@/models'
import { formatCurrency, formatNumericValue, matchesSearch } from '@/utils'

import { useLinkOrdersDialogHandler } from './use-link-orders-dialog-handler'

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
    selectedCount,
    handleRowQuoteItemChange,
    handleAddQuoteItem,
    handleRowProductChange,
    handleQuickCreateProduct,
    quickCreateDraft,
    isQuickCreateOpen,
    handleQuickCreateClose,
    handleProductCreated,
    quickCreateFamily,
    setQuickCreateFamily,
    handleConfirm
  } = useLinkOrdersDialogHandler(isOpened, invoice, quote, handleClose)

  const productMap = new Map(products.map((p) => [p.id, p]))

  return (
    <>
      <Modal
        isOpened={isOpened}
        title="Vincular pedidos"
        maxWidth={1000}
        handleClose={handleClose}
      >
        {!quote ? (
          <Typography color="text.secondary">
            Selecione uma cotação para esta nota antes de vincular os pedidos.
          </Typography>
        ) : (
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
            ) : (
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
                  {rows.map(({ item, productId, quoteItemId }) => (
                    <TableRow key={item.itemNumber}>
                      <TableCell>{item.description.toUpperCase()}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell align="right">
                        {formatNumericValue(item.quantity)}
                      </TableCell>
                      <TableCell>
                        {item.productId !== null ? (
                          (productMap
                            .get(item.productId)
                            ?.description.toUpperCase() ?? '—')
                        ) : (
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Autocomplete
                              size="small"
                              sx={{ flex: 1, minWidth: 200 }}
                              options={products}
                              getOptionLabel={(p) => p.description}
                              filterOptions={(opts, { inputValue }) =>
                                opts.filter((o) =>
                                  matchesSearch(inputValue, o.description)
                                )
                              }
                              isOptionEqualToValue={(o, v) => o.id === v.id}
                              value={
                                (productId && productMap.get(productId)) || null
                              }
                              onChange={(_, selected: TProduct | null) =>
                                handleRowProductChange(
                                  item.itemNumber,
                                  selected?.id ?? ''
                                )
                              }
                              renderInput={(params) => (
                                <TextField {...params} placeholder="Produto" />
                              )}
                            />
                            <Tooltip title="Novo Produto">
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleQuickCreateProduct(item)}
                              >
                                <Add fontSize="small" />
                              </Button>
                            </Tooltip>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          fullWidth
                          displayEmpty
                          value={quoteItemId}
                          onChange={(e) => {
                            if (e.target.value === NEW_ITEM_VALUE) {
                              handleAddQuoteItem(
                                item.itemNumber,
                                item.description
                              )
                              return
                            }
                            handleRowQuoteItemChange(
                              item.itemNumber,
                              e.target.value
                            )
                          }}
                        >
                          <MenuItem value="">
                            <em>Não vincular</em>
                          </MenuItem>
                          {[...quote.items]
                            .sort((a, b) =>
                              a.description.localeCompare(b.description)
                            )
                            .map((quoteItem) => (
                              <MenuItem key={quoteItem.id} value={quoteItem.id}>
                                {quoteItem.description.toUpperCase()}
                              </MenuItem>
                            ))}
                          <MenuItem value={NEW_ITEM_VALUE}>
                            + Adicionar item à cotação
                          </MenuItem>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
    </>
  )
}
