import type { TDepartment, TFamily, TProduct, TSupplier } from '@/models'
import type { TCreateDataWithId } from '@/types'

export type TImportData = {
  products: TCreateDataWithId<TProduct>[]
  families: TCreateDataWithId<TFamily>[]
  departments: TCreateDataWithId<TDepartment>[]
  suppliers: TCreateDataWithId<TSupplier>[]
}
