import { type TProduct } from '@/models'
import { matchesSearch } from '@/utils'

export const filterProducts = (search: string, products: TProduct[]) =>
  products.filter((p) =>
    matchesSearch(search, p.description, p.barcodes.join(' '))
  )
