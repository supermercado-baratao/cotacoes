import { Add, Delete } from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
  InputAdornment,
  Stack,
  type SxProps,
  TextField,
  type Theme,
  Typography
} from '@mui/material'
import { useFieldArray } from 'react-hook-form'

import {
  Autocomplete,
  CurrencyInput,
  Modal,
  type TModalProps
} from '@/components'
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_NUMERIC_VALUE,
  MAX_OBSERVATIONS_LENGTH
} from '@/constants'
import type { TProduct } from '@/models'
import { selectOnFocus, type TMarginStatus } from '@/utils'

import * as S from './style'
import { type TProductDraft, useFormHandler } from './use-form-handler'

export type { TProductDraft }

type TProductFormProps = {
  product: TProduct | null
  draft: TProductDraft | null
  setFormProduct: (product: TProduct | null) => void
  setQuickCreateFamily: (open: boolean) => void
  onCreated?: (product: TProduct) => void
} & Pick<TModalProps, 'isOpened' | 'handleClose'>

const percentageAdornment = <InputAdornment position="end">%</InputAdornment>

const marginStatusConfig: Record<
  TMarginStatus,
  { label: string; color: 'success' | 'error' | 'warning' }
> = {
  below: { label: 'Abaixo da margem', color: 'error' },
  above: { label: 'Acima da margem', color: 'warning' },
  ok: { label: 'Dentro da margem', color: 'success' }
}

export const ProductForm = ({
  isOpened,
  product,
  draft,
  handleClose,
  setFormProduct,
  setQuickCreateFamily,
  onCreated
}: TProductFormProps) => {
  const {
    register,
    onSubmit,
    errors,
    control,
    families,
    departments,
    marginStatus
  } = useFormHandler(product, draft, setFormProduct, handleClose, onCreated)

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'packagings'
  })

  const title = product ? 'Editar Produto' : 'Novo Produto'

  return (
    <Modal title={title} isOpened={isOpened} handleClose={handleClose}>
      <Box component="form" onSubmit={onSubmit} noValidate>
        <Box sx={S.Wrapper}>
          <TextField
            {...register('description')}
            label="Descrição"
            error={!!errors.description}
            helperText={errors.description?.message}
            sx={S.FullWidth}
            onFocus={selectOnFocus}
            slotProps={{ htmlInput: { maxLength: MAX_DESCRIPTION_LENGTH } }}
          />
          <TextField
            {...register('id')}
            label="Código VR"
            error={!!errors.id}
            helperText={errors.id?.message}
            sx={S.TwoCol}
            onFocus={selectOnFocus}
          />
          <Autocomplete
            name="familyId"
            control={control}
            options={families}
            getOptionLabel={(f) => f.description}
            getOptionValue={(f) => f.id}
            label="Família"
            error={!!errors.familyId}
            helperText={errors.familyId?.message}
            handleAddClick={() => setQuickCreateFamily(true)}
            addLabel="Nova Família"
            sx={S.TwoCol}
          />
          <Autocomplete
            name="departmentId"
            control={control}
            options={departments}
            getOptionLabel={(d) => d.description}
            getOptionValue={(d) => d.id}
            label="Departamento (margem)"
            error={!!errors.departmentId}
            helperText={errors.departmentId?.message}
            sx={S.TwoCol}
          />
          <TextField
            {...register('department')}
            label="Departamento"
            error={!!errors.department}
            helperText={errors.department?.message}
            sx={S.TwoCol}
            onFocus={selectOnFocus}
            slotProps={{ htmlInput: { maxLength: MAX_DESCRIPTION_LENGTH } }}
          />
          <TextField
            {...register('section')}
            label="Seção"
            error={!!errors.section}
            helperText={errors.section?.message}
            sx={S.TwoCol}
            onFocus={selectOnFocus}
            slotProps={{ htmlInput: { maxLength: MAX_DESCRIPTION_LENGTH } }}
          />
          <TextField
            {...register('group')}
            label="Grupo"
            error={!!errors.group}
            helperText={errors.group?.message}
            sx={S.TwoCol}
            onFocus={selectOnFocus}
            slotProps={{ htmlInput: { maxLength: MAX_DESCRIPTION_LENGTH } }}
          />
          <CurrencyInput
            name="price"
            control={control}
            label="Preço de Venda"
            error={!!errors.price}
            helperText={errors.price?.message}
            sx={S.ThreeCol}
            onFocus={selectOnFocus}
          />
          <TextField
            {...register('stock', { valueAsNumber: true })}
            label="Estoque"
            type="number"
            error={!!errors.stock}
            helperText={errors.stock?.message}
            sx={S.ThreeCol}
            onFocus={selectOnFocus}
            slotProps={{ htmlInput: { step: 0.001, max: MAX_NUMERIC_VALUE } }}
          />
          <TextField
            {...register('tax', {
              setValueAs: (value) => (value === '' ? null : Number(value))
            })}
            label="Imposto"
            type="number"
            error={!!errors.tax}
            helperText={errors.tax?.message}
            sx={S.ThreeCol}
            onFocus={selectOnFocus}
            slotProps={{
              input: { endAdornment: percentageAdornment },
              htmlInput: { min: 0, max: MAX_NUMERIC_VALUE }
            }}
          />
          <Box sx={[S.ThreeCol, S.MarginField] as SxProps<Theme>}>
            <TextField
              {...register('margin', {
                setValueAs: (value) => (value === '' ? null : Number(value))
              })}
              label="Margem Padrão"
              type="number"
              error={!!errors.margin}
              helperText={errors.margin?.message}
              onFocus={selectOnFocus}
              slotProps={{
                input: { endAdornment: percentageAdornment },
                htmlInput: { min: 0, max: MAX_NUMERIC_VALUE }
              }}
            />
            {marginStatus && (
              <Chip
                label={marginStatusConfig[marginStatus].label}
                color={marginStatusConfig[marginStatus].color}
                size="small"
              />
            )}
          </Box>

          <Box sx={S.FullWidth}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Embalagens
            </Typography>
            <Stack spacing={1}>
              {fields.map((field, index) => (
                <Stack
                  key={field.id}
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'stretch' }}
                >
                  <TextField
                    {...register(`packagings.${index}.barcode`)}
                    label="Cód. de Barras"
                    error={!!errors.packagings?.[index]?.barcode}
                    helperText={errors.packagings?.[index]?.barcode?.message}
                    onFocus={selectOnFocus}
                    sx={{ flex: 2 }}
                  />
                  <TextField
                    {...register(`packagings.${index}.packType`)}
                    label="Tipo Embalagem"
                    error={!!errors.packagings?.[index]?.packType}
                    helperText={errors.packagings?.[index]?.packType?.message}
                    onFocus={selectOnFocus}
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="contained"
                    color="inherit"
                    size="small"
                    onClick={() => remove(index)}
                    sx={{ minWidth: 'auto' }}
                    aria-label="Remover embalagem"
                  >
                    <Delete />
                  </Button>
                </Stack>
              ))}
              <Box>
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={() => append({ barcode: '', packType: '' })}
                >
                  Adicionar embalagem
                </Button>
              </Box>
            </Stack>
          </Box>

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
        </Box>

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
