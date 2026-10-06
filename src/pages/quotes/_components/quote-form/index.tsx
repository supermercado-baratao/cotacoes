import { Box, Button, TextField } from '@mui/material'

import { Modal, type TModalProps } from '@/components/ui/modal'
import { MAX_OBSERVATIONS_LENGTH } from '@/constants/length'
import type { TQuote } from '@/models/quote-model/types'
import { selectOnFocus } from '@/utils/input-handlers'

import * as S from './style'
import { useFormHandler } from './use-form-handler'

type TFormProps = {
  quote: TQuote | null
  setFormQuote: (quote: TQuote | null) => void
  handleSuccess: (date: string) => void
} & Pick<TModalProps, 'isOpened' | 'handleClose'>

export const Form = ({
  isOpened,
  quote,
  handleClose,
  setFormQuote,
  handleSuccess
}: TFormProps) => {
  const { register, onSubmit, errors } = useFormHandler(
    quote,
    setFormQuote,
    handleClose,
    handleSuccess
  )

  const title = quote ? 'Editar Cotação' : 'Nova Cotação'

  return (
    <Modal title={title} isOpened={isOpened} handleClose={handleClose}>
      <Box sx={S.Wrapper} component="form" onSubmit={onSubmit} noValidate>
        <TextField
          {...register('date')}
          label="Data"
          type="date"
          error={!!errors.date}
          helperText={errors.date?.message}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          {...register('lines')}
          label="Lista de faltas"
          placeholder={'Gelatina\nÁlcool Nobre 1L\nLeite Em Pó Ninho 480g'}
          multiline
          minRows={8}
          error={!!errors.lines}
          helperText={errors.lines?.message}
          onFocus={selectOnFocus}
        />
        <TextField
          {...register('observations')}
          label="Observações"
          multiline
          minRows={2}
          error={!!errors.observations}
          helperText={errors.observations?.message}
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
