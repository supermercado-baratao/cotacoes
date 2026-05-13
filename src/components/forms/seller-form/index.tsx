import { Add } from '@mui/icons-material'
import {
  Autocomplete,
  Box,
  Button,
  IconButton,
  TextField,
  Tooltip
} from '@mui/material'
import { Controller } from 'react-hook-form'

import { Modal, PhoneInput, type TModalProps } from '@/components'
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
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <Controller
              name="supplierIds"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  sx={{ flex: 1 }}
                  multiple
                  options={suppliers}
                  getOptionLabel={(option) => option.tradeName}
                  value={suppliers.filter((s) => field.value.includes(s.id))}
                  onChange={(_, selected) =>
                    field.onChange(selected.map((s) => s.id))
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Fornecedores"
                      error={!!errors.supplierIds}
                      helperText={errors.supplierIds?.message}
                    />
                  )}
                />
              )}
            />
            {setQuickCreateSupplier && (
              <Tooltip title="Novo Fornecedor">
                <IconButton
                  onClick={() => setQuickCreateSupplier(true)}
                  sx={{ mt: 1 }}
                >
                  <Add />
                </IconButton>
              </Tooltip>
            )}
          </Box>
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
