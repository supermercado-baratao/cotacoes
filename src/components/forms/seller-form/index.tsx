import { Box, Button, TextField } from '@mui/material'

import { Autocomplete, Modal, PhoneInput, type TModalProps } from '@/components'
import type { TSeller } from '@/models'
import { selectOnFocus } from '@/utils'

import { MAX_NAME_LENGTH } from './schema'
import * as S from './style'
import { useFormHandler } from './use-form-handler'

type TFormProps = {
  seller: TSeller | null
  setFormSeller: (seller: TSeller | null) => void
  setQuickCreateSupplier?: (value: boolean) => void
} & Pick<TModalProps, 'isOpened' | 'handleClose'>

export const SellerForm = ({
  isOpened,
  seller,
  handleClose,
  setFormSeller,
  setQuickCreateSupplier
}: TFormProps) => {
  const { control, register, onSubmit, errors, suppliers } = useFormHandler(
    seller,
    setFormSeller,
    handleClose
  )

  const title = seller ? 'Editar Vendedor' : 'Novo Vendedor'

  return (
    <>
      <Modal title={title} isOpened={isOpened} handleClose={handleClose}>
        <Box sx={S.Wrapper} component="form" onSubmit={onSubmit} noValidate>
          <TextField
            {...register('name')}
            label="Nome"
            error={!!errors.name}
            helperText={errors.name?.message}
            onFocus={selectOnFocus}
            slotProps={{ htmlInput: { maxLength: MAX_NAME_LENGTH } }}
          />
          <PhoneInput
            name="phone"
            control={control}
            label="Telefone"
            error={!!errors.phone}
            helperText={errors.phone?.message}
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
            onClickAdd={
              setQuickCreateSupplier
                ? () => setQuickCreateSupplier(true)
                : undefined
            }
            addLabel="Novo Fornecedor"
          />
          <Box sx={S.Actions}>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button type="submit" variant="contained">
              Salvar
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  )
}
