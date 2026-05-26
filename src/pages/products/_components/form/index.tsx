import { Box, Button, InputAdornment, TextField } from '@mui/material'

import {
  Autocomplete,
  CurrencyInput,
  Modal,
  type TModalProps
} from '@/components'
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_NUMERIC_VALUE,
  MAX_OBSERVATIONS_LENGTH
} from '@/constants'
import type { TProduct } from '@/models'
import { selectOnFocus } from '@/utils'

import { MAX_BARCODE_LENGTH } from './schema'
import * as S from './style'
import { useFormHandler } from './use-form-handler'

type TFormProps = {
  product: TProduct | null
  setFormProduct: (product: TProduct | null) => void
  setQuickCreateFamily: (quickCreateFamily: boolean) => void
} & Pick<TModalProps, 'isOpened' | 'handleClose'>

const percentageAdornment = <InputAdornment position="end">%</InputAdornment>

export const Form = ({
  isOpened,
  product,
  handleClose,
  setFormProduct,
  setQuickCreateFamily
}: TFormProps) => {
  const { register, onSubmit, errors, control, families } = useFormHandler(
    product,
    setFormProduct,
    handleClose
  )

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
          {...register('barcode')}
          label="Código de Barras"
          error={!!errors.barcode}
          helperText={errors.barcode?.message}
          sx={S.TwoCol}
          onFocus={selectOnFocus}
          slotProps={{ htmlInput: { maxLength: MAX_BARCODE_LENGTH } }}
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
          handleAddClick={() => setQuickCreateFamily(true)}
          addLabel="Nova Família"
          sx={S.FourCol}
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
          {...register('observations')}
          label="Observações"
          multiline
          minRows={3}
          error={!!errors.observations}
          helperText={errors.observations?.message}
          sx={S.FullWidth}
          onFocus={selectOnFocus}
          slotProps={{ htmlInput: { maxLength: MAX_OBSERVATIONS_LENGTH } }}
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
