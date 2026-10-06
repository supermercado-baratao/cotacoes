import {
  Box,
  Button,
  type CSSObject,
  TextField,
  Typography
} from '@mui/material'
import dayjs from 'dayjs'

import { CnpjInput, PhoneInput } from '@/components/ui/masked-input'
import { Modal, type TModalProps } from '@/components/ui/modal'
import { MAX_OBSERVATIONS_LENGTH } from '@/constants/length'
import type { TSupplier } from '@/models/supplier-model/types'
import { selectOnFocus } from '@/utils/input-handlers'

import { MAX_LEGAL_NAME_LENGTH, MAX_TRADE_NAME_LENGTH } from './schema'
import * as S from './style'
import { useFormHandler } from './use-form-handler'

type TSupplierFormProps = {
  supplier: TSupplier | null
  setFormSupplier: (supplier: TSupplier | null) => void
  onCreated?: (supplier: TSupplier) => void
} & Pick<TModalProps, 'isOpened' | 'handleClose'>

export const SupplierForm = ({
  isOpened,
  supplier,
  handleClose,
  setFormSupplier,
  onCreated
}: TSupplierFormProps) => {
  const { register, onSubmit, errors, control } = useFormHandler(
    supplier,
    setFormSupplier,
    handleClose,
    onCreated
  )

  const isEditing = !!supplier
  const title = isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'

  return (
    <>
      <Modal title={title} isOpened={isOpened} handleClose={handleClose}>
        <Box sx={S.Wrapper} component="form" onSubmit={onSubmit} noValidate>
          <TextField
            {...register('legalName')}
            label="Razão Social"
            error={!!errors.legalName}
            helperText={errors.legalName?.message}
            sx={S.TwoCol}
            onFocus={selectOnFocus}
            slotProps={{ htmlInput: { maxLength: MAX_LEGAL_NAME_LENGTH } }}
          />
          <TextField
            {...register('id')}
            label="Código VR"
            error={!!errors.id}
            helperText={errors.id?.message}
            sx={S.OneCol}
            onFocus={selectOnFocus}
          />
          <TextField
            {...register('tradeName')}
            label="Nome Fantasia"
            error={!!errors.tradeName}
            helperText={errors.tradeName?.message}
            sx={S.TwoCol}
            onFocus={selectOnFocus}
            slotProps={{ htmlInput: { maxLength: MAX_TRADE_NAME_LENGTH } }}
          />
          <CnpjInput
            name="cnpj"
            control={control}
            label="CNPJ"
            error={!!errors.cnpj}
            helperText={errors.cnpj?.message}
            sx={S.OneCol}
            onFocus={selectOnFocus}
          />
          <TextField
            {...register('email')}
            label="E-mail"
            type="email"
            error={!!errors.email}
            helperText={errors.email?.message}
            sx={[S.EmailField as CSSObject, S.TwoCol as CSSObject]}
            onFocus={selectOnFocus}
          />
          <PhoneInput
            name="phone"
            control={control}
            label="Telefone"
            error={!!errors.phone}
            helperText={errors.phone?.message}
            sx={S.OneCol}
            onFocus={selectOnFocus}
          />
          <TextField
            {...register('observations')}
            label="Observações"
            multiline
            minRows={3}
            error={!!errors.observations}
            helperText={errors.observations?.message}
            sx={S.FullWidth}
            onFocus={selectOnFocus}
            slotProps={{ htmlInput: { maxLength: MAX_OBSERVATIONS_LENGTH } }}
          />
          {isEditing && supplier.vrCreatedAt && (
            <Typography
              variant="caption"
              color="textSecondary"
              sx={S.FullWidth}
            >
              Cadastrado no VR em{' '}
              {dayjs(supplier.vrCreatedAt).format('DD/MM/YYYY')}
            </Typography>
          )}
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
