import { Box, Button, InputAdornment, TextField } from '@mui/material'

import {
  Autocomplete,
  CurrencyInput,
  Modal,
  type TModalProps
} from '@/components'
import type { TProduct } from '@/models'
import type { TQuickCreate } from '@/pages/products/types'
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
  setQuickCreate: (quickCreate: TQuickCreate) => void
} & Pick<TModalProps, 'isOpened' | 'handleClose'>

const percentageAdornment = <InputAdornment position="end">%</InputAdornment>

export const Form = ({
  isOpened,
  product,
  handleClose,
  setFormProduct,
  setQuickCreate
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
        <Autocomplete
          name="familyId"
          control={control}
          options={families}
          getOptionLabel={(f) => f.description}
          getOptionValue={(f) => f.id}
          label="Família"
          error={!!errors.familyId}
          helperText={errors.familyId?.message}
          onClickAdd={() => setQuickCreate('family')}
          addLabel="Nova Família"
          sx={S.AutocompleteRowFourCol}
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
        <Autocomplete
          name="supplierIds"
          control={control}
          options={suppliers}
          getOptionLabel={(s) => s.tradeName}
          getOptionValue={(s) => s.id}
          label="Fornecedores"
          error={!!errors.supplierIds}
          helperText={errors.supplierIds?.message}
          multiple
          disableCloseOnSelect
          onClickAdd={() => setQuickCreate('supplier')}
          addLabel="Novo Fornecedor"
          sx={S.AutocompleteRowFull}
        />
        <Autocomplete
          name="sellerIds"
          control={control}
          options={sellers}
          getOptionLabel={(s) => s.name}
          getOptionValue={(s) => s.id}
          label="Vendedores"
          error={!!errors.sellerIds}
          helperText={errors.sellerIds?.message}
          multiple
          disableCloseOnSelect
          onClickAdd={() => setQuickCreate('seller')}
          addLabel="Novo Vendedor"
          sx={S.AutocompleteRowFull}
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
