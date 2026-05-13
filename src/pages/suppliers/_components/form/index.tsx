import { Autocomplete, Box, Button, TextField } from '@mui/material'
import { Controller } from 'react-hook-form'

import { CnpjInput, Modal, PhoneInput, type TModalProps } from '@/components'
import type { TSupplier } from '@/models'
import { selectOnFocus } from '@/utils'

import { MAX_LEGAL_NAME_LENGTH, MAX_TRADE_NAME_LENGTH } from './schema'
import * as S from './style'
import { useFormHandler } from './use-form-handler'

type TFormProps = {
  supplier: TSupplier | null
  setFormSupplier: (supplier: TSupplier | null) => void
} & Pick<TModalProps, 'isOpened' | 'handleClose'>

export const Form = ({
  isOpened,
  supplier,
  handleClose,
  setFormSupplier
}: TFormProps) => {
  const { register, onSubmit, errors, control, sellers } = useFormHandler(
    supplier,
    setFormSupplier,
    handleClose
  )

  const title = supplier ? 'Editar Fornecedor' : 'Novo Fornecedor'

  return (
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
        <Controller
          name="sellerIds"
          control={control}
          render={({ field }) => (
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={sellers.map((s) => s.id)}
              getOptionLabel={(id) =>
                sellers.find((s) => s.id === id)?.name ?? id
              }
              isOptionEqualToValue={(option, value) => option === value}
              value={field.value}
              onChange={(_, newValue) => field.onChange(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Vendedores"
                  error={!!errors.sellerIds}
                  helperText={errors.sellerIds?.message}
                />
              )}
              sx={S.FullWidth}
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
