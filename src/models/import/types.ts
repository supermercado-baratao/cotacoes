import type { TDepartment } from '@/models/department/types'
import type { TFamily } from '@/models/family/types'
import type { TProduct } from '@/models/product/types'
import type { TSupplier } from '@/models/supplier/types'
import type { TCreateDataWithId } from '@/types/generics'

export type TImportData = {
  products: TCreateDataWithId<TProduct>[]
  families: TCreateDataWithId<TFamily>[]
  departments: TCreateDataWithId<TDepartment>[]
  suppliers: TCreateDataWithId<TSupplier>[]
}
