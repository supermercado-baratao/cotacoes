import { Alert, Box, Button, Chip, TextField, Typography } from '@mui/material'

import { DeleteDialog } from '@/components/ui/dialog'
import { Modal } from '@/components/ui/modal'
import { MAX_NUMERIC_VALUE } from '@/constants/length'
import type { TSupplier } from '@/models/supplier-model/types'
import { formatCurrency, formatNumericValue } from '@/utils/formatters'
import { selectOnFocus } from '@/utils/input-handlers'
import { marginStatusConfig } from '@/utils/margin'

import type { TInvoiceItemRow } from '../use-invoice-detail-handler'
import { MIN_PACKING_QUANTITY } from './schema'
import * as S from './style'
import { useFormHandler } from './use-form-handler'

type TPackCorrectionDialogProps = {
  row: TInvoiceItemRow | null
  supplier: TSupplier | null
  handleClose: () => void
}

const getPreviewNote = (
  row: TInvoiceItemRow,
  hasUnitCost: boolean
): string | null => {
  if (row.isBonus) return 'Bonificação: não entra no custo'
  if (hasUnitCost && !row.salePrice) return 'Produto sem preço de venda'
  return null
}

export const PackCorrectionDialog = ({
  row,
  supplier,
  handleClose
}: TPackCorrectionDialogProps) => {
  const {
    register,
    onSubmit,
    errors,
    packing,
    preview,
    hasCorrection,
    isDeleteDialogOpen,
    handleDeleteDialogOpen,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  } = useFormHandler(row, supplier, handleClose)

  const productDescription = row?.productDescription?.toUpperCase() ?? ''
  const previewNote = row
    ? getPreviewNote(row, preview?.unitCost != null)
    : null

  return (
    <Modal
      title="Corrigir Qtd. Embalagem"
      isOpened={!!row}
      maxWidth={560}
      handleClose={handleClose}
    >
      {row && (
        <Box sx={S.Wrapper} component="form" onSubmit={onSubmit} noValidate>
          <Alert severity="info" sx={S.FullWidth}>
            A correção vale para todas as notas de{' '}
            {(supplier?.tradeName || supplier?.legalName || '').toUpperCase()}{' '}
            com este produto na embalagem {packing.toUpperCase()}, a mesma usada
            na conferência de pedidos.
          </Alert>
          <Box component="dl" sx={S.Details}>
            <Box sx={S.FullWidth}>
              <Typography component="dt" sx={S.DetailLabel}>
                Produto
              </Typography>
              <Typography component="dd" sx={S.DetailValue}>
                {productDescription}
              </Typography>
            </Box>
            <Box>
              <Typography component="dt" sx={S.DetailLabel}>
                Qtd. e unidade da nota
              </Typography>
              <Typography component="dd" sx={S.DetailValue}>
                {formatNumericValue(row.quantity)} {row.unit.toUpperCase()}
              </Typography>
            </Box>
            <Box>
              <Typography component="dt" sx={S.DetailLabel}>
                Valor total c/ imposto
              </Typography>
              <Typography component="dd" sx={S.DetailValue}>
                {formatCurrency(row.totalCost ?? row.totalPrice)}
              </Typography>
            </Box>
          </Box>
          <TextField
            {...register('packingQuantity', {
              setValueAs: (value) =>
                ['', null, undefined].includes(value)
                  ? undefined
                  : Number(value)
            })}
            label="Qtd. Embalagem corrigida"
            type="number"
            autoFocus
            error={!!errors.packingQuantity}
            helperText={errors.packingQuantity?.message}
            onFocus={selectOnFocus}
            slotProps={{
              htmlInput: {
                min: MIN_PACKING_QUANTITY,
                max: MAX_NUMERIC_VALUE,
                step: 1
              }
            }}
          />
          <Box component="dl" sx={S.PreviewDetail}>
            <Typography component="dt" sx={S.DetailLabel}>
              Custo unit. c/ imposto
            </Typography>
            <Typography component="dd" sx={S.DetailValue}>
              {preview?.unitCost == null
                ? '—'
                : formatCurrency(preview.unitCost)}
            </Typography>
            {previewNote && (
              <Typography component="dd" sx={S.PreviewNote}>
                {previewNote}
              </Typography>
            )}
          </Box>
          {preview?.marginStatus && preview.margin != null && (
            <Box sx={S.FullWidth}>
              <Chip
                label={`${marginStatusConfig[preview.marginStatus].label}: ${formatNumericValue(preview.margin)}%`}
                color={marginStatusConfig[preview.marginStatus].color}
                size="small"
              />
            </Box>
          )}
          <Box sx={S.Actions}>
            {hasCorrection && (
              <Button
                color="error"
                sx={S.RemoveButton}
                onClick={handleDeleteDialogOpen}
              >
                Remover correção
              </Button>
            )}
            <Button onClick={handleClose}>Cancelar</Button>
            <Button type="submit" variant="contained">
              Salvar
            </Button>
          </Box>
        </Box>
      )}
      <DeleteDialog
        open={isDeleteDialogOpen}
        title="Remover correção"
        item={`a correção da Qtd. Embalagem de ${productDescription}`}
        handleConfirm={handleDeleteDialogConfirm}
        handleClose={handleDeleteDialogClose}
      />
    </Modal>
  )
}
