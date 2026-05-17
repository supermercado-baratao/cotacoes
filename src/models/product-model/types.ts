export type TProduct = {
  id: string
  description: string
  price: number
  lastPrice?: number
  purchasePrice: number
  lastPurchasePrice?: number
  quantity: number
  lastQuantity?: number
  packaging: string | null
  barcode: string | null
  tax: number | null
  margin: number | null
  observation: string | null
  expirationDate: string | null
  familyId: string | null
  supplierIds: string[]
  sellerIds: string[]
  createdAt: number
  updatedAt: number
}

export type TProductHistoryType = 'price' | 'purchasePrice' | 'quantity'

export type TProductHistory = {
  id: string
  type: TProductHistoryType
  oldValue: number
  newValue: number
  createdAt: number
}
