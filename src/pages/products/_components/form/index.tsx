import { Box, Button, InputAdornment, TextField } from '@mui/material'

import { CurrencyInput, Modal, type TModalProps } from '@/components'
import type { TProduct } from '@/models'
import { formatCurrencyInput, selectOnFocus } from '@/utils'

import {
  MAX_BARCODE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_FAMILY_LENGTH,
  MAX_NUMERIC_VALUE,
  MAX_OBSERVATION_LENGTH,
  MAX_PACKAGING_LENGTH,
  MAX_SUPPLIER_LENGTH
} from './schema'
import * as S from './style'
import { useFormHandler } from './use-form-handler'

type TFormProps = {
  product: TProduct | null
  setFormProduct: (product: TProduct | null) => void
} & Pick<TModalProps, 'isOpened' | 'handleClose'>

const percentageAdornment = <InputAdornment position="end">%</InputAdornment>

export const Form = ({
  isOpened,
  product,
  handleClose,
  setFormProduct
}: TFormProps) => {
  const { register, onSubmit, errors, control, suggestedPrice } =
    useFormHandler(product, setFormProduct, handleClose)

  const title = product ? 'Editar Produto' : 'Novo Produto'

  return (
    <Modal title={title} isOpened={isOpened} handleClose={handleClose}>
      <Box sx={S.Wrapper} component="form" onSubmit={onSubmit} noValidate>
        <TextField
          {...register('description')}
          label="Descrição"
          error={!!errors.description}
          helperText={errors.description?.message}
          sx={S.FullWidth}
          onFocus={selectOnFocus}
          slotProps={{
            htmlInput: {
              maxLength: MAX_DESCRIPTION_LENGTH
            }
          }}
        />
        <TextField
          {...register('packaging')}
          label="Embalagem"
          error={!!errors.packaging}
          helperText={errors.packaging?.message}
          sx={S.TwoCol}
          onFocus={selectOnFocus}
          slotProps={{
            htmlInput: {
              maxLength: MAX_PACKAGING_LENGTH
            }
          }}
        />
        <TextField
          {...register('family')}
          label="Família"
          error={!!errors.family}
          helperText={errors.family?.message}
          sx={S.FourCol}
          onFocus={selectOnFocus}
          slotProps={{
            htmlInput: {
              maxLength: MAX_FAMILY_LENGTH
            }
          }}
        />
        <CurrencyInput
          name="price"
          control={control}
          label="Preço"
          error={!!errors.price}
          helperText={errors.price?.message}
          sx={S.TwoCol}
          onFocus={selectOnFocus}
        />
        <CurrencyInput
          name="purchasePrice"
          control={control}
          label="Preço de Compra"
          error={!!errors.purchasePrice}
          helperText={errors.purchasePrice?.message}
          sx={S.TwoCol}
          onFocus={selectOnFocus}
        />
        <TextField
          {...register('quantity', { valueAsNumber: true })}
          label="Quantidade"
          type="number"
          error={!!errors.quantity}
          helperText={errors.quantity?.message}
          sx={S.TwoCol}
          onFocus={selectOnFocus}
          slotProps={{
            htmlInput: {
              min: 0,
              max: MAX_NUMERIC_VALUE
            }
          }}
        />
        <TextField
          {...register('tax', { valueAsNumber: true })}
          label="Imposto"
          type="number"
          error={!!errors.tax}
          helperText={errors.tax?.message}
          sx={S.TwoCol}
          onFocus={selectOnFocus}
          slotProps={{
            input: { endAdornment: percentageAdornment },
            htmlInput: {
              min: 0,
              max: MAX_NUMERIC_VALUE
            }
          }}
        />
        <TextField
          {...register('margin', { valueAsNumber: true })}
          label="Margem de Lucro"
          type="number"
          error={!!errors.margin}
          helperText={errors.margin?.message}
          sx={S.TwoCol}
          onFocus={selectOnFocus}
          slotProps={{
            input: { endAdornment: percentageAdornment },
            htmlInput: {
              min: 0,
              max: MAX_NUMERIC_VALUE
            }
          }}
        />
        <TextField
          label="Preço Sugerido"
          value={formatCurrencyInput(suggestedPrice ?? 0)}
          disabled
          sx={S.TwoCol}
          onFocus={selectOnFocus}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">R$</InputAdornment>
              )
            }
          }}
        />
        <TextField
          {...register('barcode')}
          label="Código de Barras"
          error={!!errors.barcode}
          helperText={errors.barcode?.message}
          sx={S.FourCol}
          onFocus={selectOnFocus}
          slotProps={{
            htmlInput: {
              maxLength: MAX_BARCODE_LENGTH
            }
          }}
        />
        <TextField
          {...register('expirationDate')}
          label="Data de Validade"
          type="date"
          error={!!errors.expirationDate}
          helperText={errors.expirationDate?.message}
          sx={S.TwoCol}
          onFocus={selectOnFocus}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          {...register('supplier')}
          label="Fornecedor"
          error={!!errors.supplier}
          helperText={errors.supplier?.message}
          sx={S.FullWidth}
          onFocus={selectOnFocus}
          slotProps={{
            htmlInput: {
              maxLength: MAX_SUPPLIER_LENGTH
            }
          }}
        />
        <TextField
          {...register('observation')}
          label="Observações"
          multiline
          minRows={3}
          error={!!errors.observation}
          helperText={errors.observation?.message}
          sx={S.FullWidth}
          onFocus={selectOnFocus}
          slotProps={{
            htmlInput: {
              maxLength: MAX_OBSERVATION_LENGTH
            }
          }}
        />
        <Box sx={S.Actions}>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" variant="contained">
            Salvar
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}
