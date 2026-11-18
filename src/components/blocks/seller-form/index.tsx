import { Box, Button, TextField } from '@mui/material'

import { Autocomplete } from '@/components/ui/autocomplete'
import { PhoneInput } from '@/components/ui/masked-input'
import { Modal, type TModalProps } from '@/components/ui/modal'
import { MAX_DESCRIPTION_LENGTH } from '@/constants/length'
import type { TSeller } from '@/models/seller/types'
import { selectOnFocus } from '@/utils/input-handlers'

import * as S from './style'
import { useFormHandler } from './use-form-handler'

type TSellerFormProps = {
  seller: TSeller | null
  setFormSeller: (seller: TSeller | null) => void
  setQuickCreateSupplier?: (value: boolean) => void
  onCreated?: (seller: TSeller) => void
} & Pick<TModalProps, 'isOpened' | 'handleClose'>

export const SellerForm = ({
  isOpened,
  seller,
  handleClose,
  setFormSeller,
  setQuickCreateSupplier,
  onCreated
}: TSellerFormProps) => {
  const { control, register, onSubmit, errors, suppliers } = useFormHandler(
    seller,
    setFormSeller,
    handleClose,
    onCreated
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
            slotProps={{ htmlInput: { maxLength: MAX_DESCRIPTION_LENGTH } }}
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
            getOptionLabel={(s) => s.tradeName ?? s.legalName}
            getOptionValue={(s) => s.id}
            label="Fornecedores"
            error={!!errors.supplierIds}
            helperText={errors.supplierIds?.message}
            multiple
            disableCloseOnSelect
            handleAddClick={
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
