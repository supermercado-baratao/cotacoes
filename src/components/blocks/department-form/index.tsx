import { Box, Button, TextField } from '@mui/material'

import { Modal, type TModalProps } from '@/components/ui/modal'
import { MAX_DESCRIPTION_LENGTH } from '@/constants/length'
import type { TDepartment } from '@/models/department/types'
import { selectOnFocus } from '@/utils/input-handlers'

import * as S from './style'
import { useFormHandler } from './use-form-handler'

type TDepartmentFormProps = {
  department: TDepartment | null
  setFormDepartment: (department: TDepartment | null) => void
} & Pick<TModalProps, 'isOpened' | 'handleClose'>

export const DepartmentForm = ({
  isOpened,
  department,
  handleClose,
  setFormDepartment
}: TDepartmentFormProps) => {
  const { register, onSubmit, errors } = useFormHandler(
    department,
    setFormDepartment,
    handleClose
  )

  const title = department ? 'Editar Departamento' : 'Novo Departamento'

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
