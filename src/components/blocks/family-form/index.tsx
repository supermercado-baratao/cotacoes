import { Box, Button, TextField } from '@mui/material'

import { Modal, type TModalProps } from '@/components/ui/modal'
import { MAX_DESCRIPTION_LENGTH } from '@/constants/length'
import type { TFamily } from '@/models/family/types'
import { selectOnFocus } from '@/utils/input-handlers'

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
  const { register, onSubmit, errors } = useFormHandler(
    family,
    setFormFamily,
    handleClose
  )

  const title = family ? 'Editar Família' : 'Nova Família'

  return (
    <Modal title={title} isOpened={isOpened} handleClose={handleClose}>
      <Box sx={S.Wrapper} component="form" onSubmit={onSubmit} noValidate>
        <TextField
          {...register('id')}
          label="Código VR"
          error={!!errors.id}
          helperText={errors.id?.message}
          onFocus={selectOnFocus}
        />
        <TextField
          {...register('description')}
          label="Descrição"
          error={!!errors.description}
          helperText={errors.description?.message}
          onFocus={selectOnFocus}
          slotProps={{ htmlInput: { maxLength: MAX_DESCRIPTION_LENGTH } }}
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
