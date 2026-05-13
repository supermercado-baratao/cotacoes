import { Autocomplete, Box, Button, TextField } from '@mui/material'
import { Controller } from 'react-hook-form'

import { Modal, type TModalProps } from '@/components'
import type { TFamily } from '@/models'
import { selectOnFocus } from '@/utils'

import { MAX_DESCRIPTION_LENGTH } from './schema'
import * as S from './style'
import { useFormHandler } from './use-form-handler'

type TFormProps = {
  family: TFamily | null
  setFormFamily: (family: TFamily | null) => void
} & Pick<TModalProps, 'isOpened' | 'handleClose'>

export const FamilyForm = ({
  isOpened,
  family,
  handleClose,
  setFormFamily
}: TFormProps) => {
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
        <Controller
          name="productIds"
          control={control}
          render={({ field }) => (
            <Autocomplete
              multiple
              options={products || []}
              getOptionLabel={(option) => option.description}
              value={(products || []).filter((p) => field.value.includes(p.id))}
              onChange={(_, selected) =>
                field.onChange(selected.map((p) => p.id))
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Produtos"
                  error={!!errors.productIds}
                  helperText={errors.productIds?.message}
                />
              )}
            />
          )}
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
