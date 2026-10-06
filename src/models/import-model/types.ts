import type { TDepartment } from '@/models/department-model/types'
import type { TFamily } from '@/models/family-model/types'
import type { TProduct } from '@/models/product-model/types'
import type { TSupplier } from '@/models/supplier-model/types'
import type { TCreateDataWithId } from '@/types/generics'

export type TImportData = {
  products: TCreateDataWithId<TProduct>[]
  families: TCreateDataWithId<TFamily>[]
  departments: TCreateDataWithId<TDepartment>[]
  suppliers: TCreateDataWithId<TSupplier>[]
}
