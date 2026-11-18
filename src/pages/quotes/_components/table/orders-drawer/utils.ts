import type { TProduct } from '@/models/product/types'
import type { TSeller } from '@/models/seller/types'
import type { TSupplier } from '@/models/supplier/types'

export const getProductDescription = (
  productId: string,
  products: TProduct[]
) => products?.find((product) => product.id === productId)?.description ?? '—'

export const getSupplierName = (supplierId: string, suppliers: TSupplier[]) =>
  suppliers?.find((supplier) => supplier.id === supplierId)?.tradeName ?? '—'

export const getSellerName = (sellerId: string | null, sellers: TSeller[]) =>
  sellerId
    ? (sellers?.find((seller) => seller.id === sellerId)?.name ?? '—')
    : '—'
