import { Box, Button, TextField } from '@mui/material'

import {
  Autocomplete,
  CnpjInput,
  Modal,
  PhoneInput,
  type TModalProps
} from '@/components'
import type { TSupplier } from '@/models'
import { selectOnFocus } from '@/utils'

import { MAX_LEGAL_NAME_LENGTH, MAX_TRADE_NAME_LENGTH } from './schema'
import * as S from './style'
import { useFormHandler } from './use-form-handler'

type TFormProps = {
  supplier: TSupplier | null
  setFormSupplier: (supplier: TSupplier | null) => void
  setQuickCreateSeller?: (value: boolean) => void
} & Pick<TModalProps, 'isOpened' | 'handleClose'>

export const SupplierForm = ({
  isOpened,
  supplier,
  handleClose,
  setFormSupplier,
  setQuickCreateSeller
}: TFormProps) => {
  const { register, onSubmit, errors, control, sellers } = useFormHandler(
    supplier,
    setFormSupplier,
    handleClose
  )

  const title = supplier ? 'Editar Fornecedor' : 'Novo Fornecedor'

  return (
    <>
      <Modal title={title} isOpened={isOpened} handleClose={handleClose}>
        <Box sx={S.Wrapper} component="form" onSubmit={onSubmit} noValidate>
          <TextField
            {...register('legalName')}
            label="Razão Social"
            error={!!errors.legalName}
            helperText={errors.legalName?.message}
            sx={S.FullWidth}
            onFocus={selectOnFocus}
            slotProps={{ htmlInput: { maxLength: MAX_LEGAL_NAME_LENGTH } }}
          />
          <TextField
            {...register('tradeName')}
            label="Nome Fantasia"
            error={!!errors.tradeName}
            helperText={errors.tradeName?.message}
            sx={S.FullWidth}
            onFocus={selectOnFocus}
            slotProps={{ htmlInput: { maxLength: MAX_TRADE_NAME_LENGTH } }}
          />
          <CnpjInput
            name="cnpj"
            control={control}
            label="CNPJ"
            error={!!errors.cnpj}
            helperText={errors.cnpj?.message}
            sx={S.ThreeCol}
            onFocus={selectOnFocus}
          />
          <PhoneInput
            name="phone"
            control={control}
            label="Telefone"
            error={!!errors.phone}
            helperText={errors.phone?.message}
            sx={S.ThreeCol}
            onFocus={selectOnFocus}
          />
          <TextField
            {...register('email')}
            label="E-mail"
            type="email"
            error={!!errors.email}
            helperText={errors.email?.message}
            sx={S.EmailField}
            onFocus={selectOnFocus}
          />
          <Autocomplete
            name="sellerIds"
            control={control}
            options={sellers}
            getOptionLabel={(s) => s.name}
            getOptionValue={(s) => s.id}
            label="Vendedores"
            error={!!errors.sellerIds}
            helperText={errors.sellerIds?.message}
            multiple
            disableCloseOnSelect
            handleAddClick={
              setQuickCreateSeller
                ? () => setQuickCreateSeller(true)
                : undefined
            }
            addLabel="Novo Vendedor"
            sx={S.FullWidth}
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
