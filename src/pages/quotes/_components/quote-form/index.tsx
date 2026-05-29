import { Add } from '@mui/icons-material'
import {
  Box,
  Button,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'

import { Modal, SearchInput, type TModalProps } from '@/components'
import { MAX_OBSERVATIONS_LENGTH } from '@/constants'
import type { TQuote } from '@/models'

import * as S from './style'
import { useFormHandler } from './use-form-handler'

type TFormProps = {
  quote: TQuote | null
  setFormQuote: (quote: TQuote | null) => void
  setQuickCreateProduct: (open: boolean) => void
} & Pick<TModalProps, 'isOpened' | 'handleClose'>

export const Form = ({
  isOpened,
  quote,
  handleClose,
  setFormQuote,
  setQuickCreateProduct
}: TFormProps) => {
  const {
    register,
    onSubmit,
    errors,
    productSearch,
    setProductSearch,
    filteredProducts,
    selectedProducts,
    handleProductToggle
  } = useFormHandler(quote, setFormQuote, handleClose)

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

        <Box sx={S.ProductsSection}>
          <Typography variant="subtitle2">Produtos</Typography>
          <Box sx={S.ProductSearchRow}>
            <SearchInput
              placeholder="Pesquisar produto..."
              value={productSearch}
              onValueChange={setProductSearch}
              sx={{ flex: 1, maxWidth: 'none' }}
            />
            <Tooltip title="Novo Produto">
              <Button
                variant="contained"
                color="inherit"
                size="small"
                sx={{ minWidth: 'auto' }}
                onClick={() => setQuickCreateProduct(true)}
              >
                <Add />
              </Button>
            </Tooltip>
          </Box>
          <List sx={S.ProductList}>
            {filteredProducts.map((product) => (
              <ListItem key={product.id} disablePadding>
                <ListItemButton
                  dense
                  onClick={() => handleProductToggle(product.id)}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={selectedProducts.includes(product.id)}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={product.description}
                    slotProps={{
                      primary: { variant: 'body2' }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

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
