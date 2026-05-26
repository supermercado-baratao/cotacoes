import { Box, Button, TextField } from '@mui/material'

import { Autocomplete, Modal, type TModalProps } from '@/components'
import { MAX_DESCRIPTION_LENGTH } from '@/constants'
import type { TFamily } from '@/models'
import { selectOnFocus } from '@/utils'

import * as S from './style'
import { useFormHandler } from './use-form-handler'

type TFamilyFormProps = {
  family: TFamily | null
  setFormFamily: (family: TFamily | null) => void
} & Pick<TModalProps, 'isOpened' | 'handleClose'>

export const FamilyForm = ({
  isOpened,
  family,
  handleClose,
  setFormFamily
}: TFamilyFormProps) => {
  const { register, onSubmit, errors, control, products } = useFormHandler(
    family,
    setFormFamily,
    handleClose
  )

  const title = family ? 'Editar Família' : 'Nova Família'

  return (
    <Modal title={title} isOpened={isOpened} handleClose={handleClose}>
      <Box sx={S.Wrapper} component="form" onSubmit={onSubmit} noValidate>
        <TextField
          {...register('description')}
          label="Descrição"
          error={!!errors.description}
          helperText={errors.description?.message}
          onFocus={selectOnFocus}
          slotProps={{ htmlInput: { maxLength: MAX_DESCRIPTION_LENGTH } }}
        />
        <Autocomplete
          name="productIds"
          control={control}
          options={products ?? []}
          getOptionLabel={(p) => p.description}
          getOptionValue={(p) => p.id}
          label="Produtos"
          error={!!errors.productIds}
          helperText={errors.productIds?.message}
          multiple
          disableCloseOnSelect
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
