import { Box, Button, TextField } from '@mui/material'
import { type FormEvent, useState } from 'react'

import { Modal } from '@/components/ui/modal'
import { MAX_DESCRIPTION_LENGTH } from '@/constants/length'
import type { TAddQuoteItemDraft } from '@/pages/invoices/detail/use-link-orders-dialog-handler'
import { selectOnFocus } from '@/utils/input-handlers'

import * as S from './style'

type TAddQuoteItemDialogProps = {
  draft: TAddQuoteItemDraft | null
  handleClose: () => void
  handleConfirm: (description: string) => void
}

export const AddQuoteItemDialog = ({
  draft,
  handleClose,
  handleConfirm
}: TAddQuoteItemDialogProps) => {
  const [description, setDescription] = useState(draft?.description ?? '')

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    handleConfirm(description)
  }

  return (
    <Modal
      title="Adicionar item à cotação"
      isOpened={!!draft}
      handleClose={handleClose}
    >
      <Box sx={S.Wrapper} component="form" onSubmit={onSubmit} noValidate>
        <TextField
          label="Descrição"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          onFocus={selectOnFocus}
          autoFocus
          fullWidth
          slotProps={{ htmlInput: { maxLength: MAX_DESCRIPTION_LENGTH } }}
        />
        <Box sx={S.Actions}>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!description.trim()}
          >
            Adicionar
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}
