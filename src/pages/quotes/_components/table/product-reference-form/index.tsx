import { TrendingDown, TrendingFlat, TrendingUp } from '@mui/icons-material'
import { Box, Button, InputAdornment, TextField } from '@mui/material'

import {
  Autocomplete,
  CurrencyInput,
  Modal,
  type TModalProps
} from '@/components'
import type { TQuote, TQuoteItem } from '@/models'
import { formatCurrency, selectOnFocus } from '@/utils'

import * as S from './style'
import { useFormHandler } from './use-form-handler'

type TProductReferenceFormProps = {
  quoteItem: TQuoteItem | null
  quote: TQuote
  handleClose: () => void
} & Pick<TModalProps, 'isOpened'>

export const ProductReferenceForm = ({
  isOpened,
  quoteItem,
  quote,
  handleClose
}: TProductReferenceFormProps) => {
  const { control, onSubmit, families, products, priceComparison } =
    useFormHandler(quoteItem, quote, handleClose)

  const PriceTrendIcon =
    priceComparison == null ||
    priceComparison.currentPrice === priceComparison.quotedPrice
      ? TrendingFlat
      : priceComparison.currentPrice > priceComparison.quotedPrice
        ? TrendingUp
        : TrendingDown

  return (
    <Modal
      title="Referência de preço"
      isOpened={isOpened}
      handleClose={handleClose}
    >
      <Box sx={S.Wrapper} component="form" onSubmit={onSubmit} noValidate>
        <Autocomplete
          name="familyId"
          control={control}
          options={families}
          getOptionLabel={(f) => f.description}
          getOptionValue={(f) => f.id}
          label="Família"
        />
        <Autocomplete
          name="productId"
          control={control}
          options={products}
          getOptionLabel={(p) => p.description}
          getOptionValue={(p) => p.id}
          label="Produto específico"
        />
        <Box sx={S.PriceRow}>
          <CurrencyInput
            name="salePrice"
            control={control}
            label="Preço na cotação"
            onFocus={selectOnFocus}
          />
          {priceComparison && (
            <TextField
              label="Preço atual"
              value={formatCurrency(priceComparison.currentPrice)}
              slotProps={{
                input: {
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <PriceTrendIcon fontSize="small" />
                    </InputAdornment>
                  )
                },
                inputLabel: { shrink: true }
              }}
            />
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
  )
}
