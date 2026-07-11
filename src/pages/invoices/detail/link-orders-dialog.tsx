import {
  Alert,
  Button,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'

import { Modal } from '@/components'
import type { TInvoice, TQuote } from '@/models'
import { formatCurrency, formatNumericValue } from '@/utils'

import { useLinkOrdersDialogHandler } from './use-link-orders-dialog-handler'

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
    rows,
    selectedCount,
    handleRowQuoteItemChange,
    handleConfirm
  } = useLinkOrdersDialogHandler(isOpened, invoice, quote, handleClose)

  return (
    <Modal
      isOpened={isOpened}
      title="Vincular pedidos"
      maxWidth={900}
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
              Fornecedor não cadastrado — não é possível criar pedidos para esta
              nota.
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
                  <TableCell>Item da cotação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(({ item, quoteItemId }) => (
                  <TableRow key={item.itemNumber}>
                    <TableCell>{item.description.toUpperCase()}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(item.unitPrice)}
                    </TableCell>
                    <TableCell align="right">
                      {formatNumericValue(item.quantity)}
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        fullWidth
                        displayEmpty
                        value={quoteItemId}
                        onChange={(e) =>
                          handleRowQuoteItemChange(
                            item.itemNumber,
                            e.target.value
                          )
                        }
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
  )
}
