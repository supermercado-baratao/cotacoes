import { type TProduct } from '@/models'

export const filterProducts = (search: string, products: TProduct[]) => {
  const lower = search.toLowerCase()
  return products.filter(
    (p) =>
      p.description.toLowerCase().includes(lower) ||
      p.barcode?.toLowerCase().includes(lower)
  )
}
