import { familyModel } from '@/models/family-model'
import { productModel } from '@/models/product-model'
import { supplierModel } from '@/models/supplier-model'

import type { TImportData } from './types'

const importData = async ({
  families,
  suppliers,
  products
}: TImportData): Promise<void> => {
  await Promise.all([
    familyModel.createMany(families),
    supplierModel.createMany(suppliers),
    productModel.createMany(products)
  ])
}

export const importModel = { import: importData }
