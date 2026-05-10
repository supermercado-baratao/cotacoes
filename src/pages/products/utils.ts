import { type TProduct } from '@/models'

export const filterProducts = (search: string, products: TProduct[]) => {
  const lower = search.toLowerCase()
  return products.filter(
    (p) =>
      p.description.toLowerCase().includes(lower) ||
      p.barcode?.toLowerCase().includes(lower) ||
      p.supplier?.toLowerCase().includes(lower)
  )
}

type TCalcSuggestedPriceProps = Pick<
  TProduct,
  'purchasePrice' | 'tax' | 'margin'
>

export const calcSuggestedPrice = ({
  purchasePrice,
  tax,
  margin
}: TCalcSuggestedPriceProps): number => {
  const priceWithTax = purchasePrice * (1 + (tax || 0) / 100)
  return priceWithTax * (1 + (margin || 0) / 100)
}
