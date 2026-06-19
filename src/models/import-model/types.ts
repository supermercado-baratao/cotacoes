import type { TFamily, TProduct, TSupplier } from '@/models'
import type { TCreateDataWithId } from '@/types'

export type TImportData = {
  products: TCreateDataWithId<TProduct>[]
  families: TCreateDataWithId<TFamily>[]
  suppliers: TCreateDataWithId<TSupplier>[]
}
