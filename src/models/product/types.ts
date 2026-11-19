import { Timestamp } from 'firebase/firestore'

// Supplier product code (<cProd> in the NF-e) and how many sale units each
// packing of that code holds. Comes from produtofornecedor /
// produtofornecedorcodigoexterno in the VR, the same data the VR uses to
// convert quantities when entering the invoice.
export type TSupplierPacking = {
  supplierId: string
  supplierProductCode: string
  packQuantity: number
}

export type TMarginCostSource = 'vr' | 'entries' | 'lastEntry'

export type TProduct = {
  id: string
  description: string
  price: number
  barcodes: string[]
  packTypes: string[]
  // Aligned with `barcodes` (produtoautomacao.qtdembalagem). Missing in
  // products imported before these fields were added.
  packQuantities?: number[]
  supplierPackings?: TSupplierPacking[]
  tax: number | null
  margin: number | null
  costWithTax: number | null
  // `null`/missing = default (VR, else the invoice average). Kept out of
  // UPSERT_MANY_UPDATABLE_FIELDS to survive a catalog reimport.
  marginCostSource?: TMarginCostSource | null
  observations: string | null
  familyId: string | null
  departmentId: string | null
  department: string
  section: string
  group: string
  stock: number
  vrCreatedAt: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
