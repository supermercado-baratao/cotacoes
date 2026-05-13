import {
  Autocomplete,
  Box,
  Button,
  InputAdornment,
  TextField
} from '@mui/material'
import { Controller } from 'react-hook-form'

import { CurrencyInput, Modal, type TModalProps } from '@/components'
import type { TProduct } from '@/models'
import { formatCurrencyInput, selectOnFocus } from '@/utils'

import {
  MAX_BARCODE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_NUMERIC_VALUE,
  MAX_OBSERVATION_LENGTH,
  MAX_PACKAGING_LENGTH
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
  const {
    register,
    onSubmit,
    errors,
    control,
    suggestedPrice,
    suppliers,
    sellers,
    families
  } = useFormHandler(product, setFormProduct, handleClose)

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
          slotProps={{ htmlInput: { maxLength: MAX_DESCRIPTION_LENGTH } }}
        />
        <TextField
          {...register('packaging')}
          label="Embalagem"
          error={!!errors.packaging}
          helperText={errors.packaging?.message}
          sx={S.TwoCol}
          onFocus={selectOnFocus}
          slotProps={{ htmlInput: { maxLength: MAX_PACKAGING_LENGTH } }}
        />
        <Controller
          name="familyId"
          control={control}
          render={({ field }) => (
            <Autocomplete
              options={families.map((f) => f.id)}
              getOptionLabel={(id) =>
                families.find((f) => f.id === id)?.description ?? id
              }
              isOptionEqualToValue={(option, value) => option === value}
              value={field.value ?? null}
              onChange={(_, newValue) => field.onChange(newValue ?? undefined)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Família"
                  error={!!errors.familyId}
                  helperText={errors.familyId?.message}
                />
              )}
              sx={S.FourCol}
            />
          )}
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
          slotProps={{ htmlInput: { min: 0, max: MAX_NUMERIC_VALUE } }}
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
            htmlInput: { min: 0, max: MAX_NUMERIC_VALUE }
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
            htmlInput: { min: 0, max: MAX_NUMERIC_VALUE }
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
          slotProps={{ htmlInput: { maxLength: MAX_BARCODE_LENGTH } }}
        />
        <TextField
          {...register('expirationDate', {
            setValueAs: (v: string) => (v === '' ? null : v)
          })}
          label="Data de Validade"
          type="date"
          error={!!errors.expirationDate}
          helperText={errors.expirationDate?.message}
          sx={S.TwoCol}
          onFocus={selectOnFocus}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Controller
          name="supplierIds"
          control={control}
          render={({ field }) => (
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={suppliers.map((s) => s.id)}
              getOptionLabel={(id) =>
                suppliers.find((s) => s.id === id)?.tradeName ?? id
              }
              isOptionEqualToValue={(option, value) => option === value}
              value={field.value}
              onChange={(_, newValue) => field.onChange(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Fornecedores"
                  error={!!errors.supplierIds}
                  helperText={errors.supplierIds?.message}
                />
              )}
              sx={S.FullWidth}
            />
          )}
        />
        <Controller
          name="sellerIds"
          control={control}
          render={({ field }) => (
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={sellers.map((s) => s.id)}
              getOptionLabel={(id) =>
                sellers.find((s) => s.id === id)?.name ?? id
              }
              isOptionEqualToValue={(option, value) => option === value}
              value={field.value}
              onChange={(_, newValue) => field.onChange(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Vendedores"
                  error={!!errors.sellerIds}
                  helperText={errors.sellerIds?.message}
                />
              )}
              sx={S.FullWidth}
            />
          )}
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
          slotProps={{ htmlInput: { maxLength: MAX_OBSERVATION_LENGTH } }}
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
