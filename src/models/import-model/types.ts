import type { TFamily } from '@/models/family-model'
import type { TProduct } from '@/models/product-model'
import type { TSupplier } from '@/models/supplier-model'
import type { TCreateData } from '@/types'

export type TImportData = {
  products: TCreateData<TProduct>[]
  families: TCreateData<TFamily>[]
  suppliers: TCreateData<TSupplier>[]
}
