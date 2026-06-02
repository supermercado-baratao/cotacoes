import { Box, Button, TextField } from '@mui/material'

import { Modal, type TModalProps } from '@/components'
import { MAX_DESCRIPTION_LENGTH } from '@/constants'
import type { TGroup } from '@/models'
import { selectOnFocus } from '@/utils'

import * as S from './style'
import { useFormHandler } from './use-form-handler'

type TGroupFormProps = {
  group: TGroup | null
  setFormGroup: (group: TGroup | null) => void
} & Pick<TModalProps, 'isOpened' | 'handleClose'>

export const GroupForm = ({
  isOpened,
  group,
  handleClose,
  setFormGroup
}: TGroupFormProps) => {
  const { register, onSubmit, errors } = useFormHandler(
    group,
    setFormGroup,
    handleClose
  )

  const title = group ? 'Editar Grupo' : 'Novo Grupo'

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
