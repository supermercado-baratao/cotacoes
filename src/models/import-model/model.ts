import { departmentModel } from '@/models/department-model'
import { familyModel } from '@/models/family-model'
import { productModel } from '@/models/product-model'
import { supplierModel } from '@/models/supplier-model'

import type { TImportData } from './types'

const importData = async ({
  families,
  departments,
  suppliers,
  products
}: TImportData): Promise<void> => {
  await Promise.all([
    familyModel.upsertMany(families),
    departmentModel.upsertMany(departments),
    supplierModel.upsertMany(suppliers),
    productModel.upsertMany(products)
  ])
}

export const importModel = { import: importData }
