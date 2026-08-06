import {
  Alert,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material'
import { useState } from 'react'

import { Autocomplete, Modal, SellerForm, type TModalProps } from '@/components'
import { MAX_NUMERIC_VALUE, MAX_OBSERVATIONS_LENGTH } from '@/constants'
import type { TInvoice, TQuote, TQuoteItem, TSupplier } from '@/models'
import { formatCurrency, formatNumericValue, selectOnFocus } from '@/utils'

import type { TBatchGroup } from '../../utils'
import * as S from './style'
import { useFormHandler } from './use-form-handler'

type TBatchConfirmDialogProps = {
  group: TBatchGroup | null
  quoteItem: TQuoteItem | null
  invoice: TInvoice
  quote: TQuote
  supplier: TSupplier
  handleClose: () => void
} & Pick<TModalProps, 'isOpened'>

export const BatchConfirmDialog = ({
  isOpened,
  group,
  quoteItem,
  invoice,
  quote,
  supplier,
  handleClose
}: TBatchConfirmDialogProps) => {
  const {
    register,
    onSubmit,
    errors,
    control,
    sellers,
    previewRows,
    handleSellerCreated
  } = useFormHandler(group, invoice, quote, supplier, handleClose)

  const [quickCreateSeller, setQuickCreateSeller] = useState(false)

  if (!group) return null

  return (
    <>
      <Modal
        title="Confirmar pedidos em lote"
        isOpened={isOpened}
        handleClose={handleClose}
      >
        <Box sx={S.Wrapper} component="form" onSubmit={onSubmit} noValidate>
          {quoteItem && (
            <Box sx={S.ItemBanner}>
              <Typography variant="caption" sx={S.ItemLabel}>
                item da cotação
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {quoteItem.description}
              </Typography>
            </Box>
          )}
          {group.outliers.length > 0 && (
            <Alert severity="warning" sx={S.OutlierNote}>
              {group.outliers.length === 1
                ? '1 item ficou de fora deste lote'
                : `${group.outliers.length} itens ficaram de fora deste lote`}{' '}
              por ter embalagem diferente ({group.packing.toUpperCase()} nos
              demais) — será confirmado individualmente em seguida.
            </Alert>
          )}
          <TextField
            {...register('packing')}
            label="Embalagem"
            error={!!errors.packing}
            helperText={errors.packing?.message}
            sx={S.TwoCol}
            onFocus={selectOnFocus}
          />
          <TextField
            {...register('packingQuantity', {
              setValueAs: (v) =>
                v === '' || v === null || v === undefined
                  ? undefined
                  : parseInt(v, 10)
            })}
            label="Qtd. Embalagem"
            type="number"
            error={!!errors.packingQuantity}
            helperText={errors.packingQuantity?.message}
            sx={S.TwoCol}
            onFocus={selectOnFocus}
            slotProps={{
              htmlInput: { min: 1, max: MAX_NUMERIC_VALUE, step: 1 }
            }}
          />
          <TextField
            {...register('date')}
            label="Data"
            type="date"
            error={!!errors.date}
            helperText={errors.date?.message}
            sx={S.TwoCol}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Fornecedor"
            value={supplier.tradeName}
            sx={S.TwoColRowStart}
            slotProps={{ input: { readOnly: true } }}
          />
          <Autocomplete
            name="sellerId"
            control={control}
            options={sellers}
            getOptionLabel={(s) => s.name}
            getOptionValue={(s) => s.id}
            label="Vendedor"
            addLabel="Novo Vendedor"
            handleAddClick={() => setQuickCreateSeller(true)}
            sx={S.TwoCol}
          />
          <TextField
            {...register('observations')}
            label="Observações"
            multiline
            minRows={2}
            error={!!errors.observations}
            helperText={errors.observations?.message}
            sx={S.FullWidth}
            onFocus={selectOnFocus}
            slotProps={{ htmlInput: { maxLength: MAX_OBSERVATIONS_LENGTH } }}
          />
          <Box sx={S.FullWidth}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Cód VR</TableCell>
                  <TableCell>Descrição NF</TableCell>
                  <TableCell align="right">Qtd</TableCell>
                  <TableCell align="right">Preço de Venda</TableCell>
                  <TableCell align="right">Preço de Custo</TableCell>
                  <TableCell align="right">Margem</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {previewRows.map(({ row, price, salePrice, margin }) => (
                  <TableRow key={row.item.itemNumber}>
                    <TableCell>{row.productId}</TableCell>
                    <TableCell>{row.item.description.toUpperCase()}</TableCell>
                    <TableCell align="right">
                      <TextField
                        value={formatNumericValue(row.item.quantity)}
                        size="small"
                        sx={S.CellInput}
                        slotProps={{ input: { readOnly: true } }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        value={
                          salePrice != null ? formatCurrency(salePrice) : '—'
                        }
                        size="small"
                        sx={S.CellInput}
                        slotProps={{ input: { readOnly: true } }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        value={formatCurrency(price)}
                        size="small"
                        sx={S.CellInput}
                        slotProps={{ input: { readOnly: true } }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        value={
                          margin != null
                            ? `${formatNumericValue(margin)}%`
                            : '—'
                        }
                        size="small"
                        sx={S.CellInput}
                        slotProps={{ input: { readOnly: true } }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
          <Box sx={S.Actions}>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button type="submit" variant="contained">
              Confirmar ({previewRows.length})
            </Button>
          </Box>
        </Box>
      </Modal>
      <SellerForm
        isOpened={quickCreateSeller}
        seller={null}
        setFormSeller={() => {}}
        handleClose={() => setQuickCreateSeller(false)}
        onCreated={(seller) => {
          handleSellerCreated(seller)
          setQuickCreateSeller(false)
        }}
      />
    </>
  )
}
