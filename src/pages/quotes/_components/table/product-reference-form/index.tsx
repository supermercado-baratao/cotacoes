import { TrendingDown, TrendingFlat, TrendingUp } from '@mui/icons-material'
import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material'

import { Autocomplete } from '@/components/ui/autocomplete'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Modal, type TModalProps } from '@/components/ui/modal'
import type { TAiSuggestion } from '@/infra/gemini'
import type { TQuote, TQuoteItem } from '@/models/quote-model/types'
import { formatCurrency } from '@/utils/formatters'
import { selectOnFocus } from '@/utils/input-handlers'

import * as S from './style'
import { useFormHandler } from './use-form-handler'

type TProductReferenceFormProps = {
  quoteItem: TQuoteItem | null
  quote: TQuote
  handleClose: () => void
  initialSuggestion?: TAiSuggestion | null
} & Pick<TModalProps, 'isOpened'>

export const ProductReferenceForm = ({
  isOpened,
  quoteItem,
  quote,
  handleClose,
  initialSuggestion = null
}: TProductReferenceFormProps) => {
  const { control, onSubmit, families, products, priceComparison } =
    useFormHandler(quoteItem, quote, handleClose, initialSuggestion)

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
        {quoteItem && (
          <Box sx={S.ItemBanner}>
            <Typography variant="caption" sx={S.ItemLabel}>
              item
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {quoteItem.description}
            </Typography>
          </Box>
        )}
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
