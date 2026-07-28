import { Timestamp } from 'firebase/firestore'

export type TPriceAdjustmentCostSource = 'quote' | 'file'

export type TPriceAdjustmentDateRange = {
  startDate: string
  endDate: string
}

export type TPriceAdjustment = {
  id: string
  code: string
  description: string
  previousPrice: number
  fileCost: number
  newSalePrice: number
  lastEntryDate: string | null
  changeDateTime: string
  movementDate: string | null
  user: string
  productId: string
  productFound: boolean
  currentSystemPrice: number | null
  resolvedCost: number
  costSource: TPriceAdjustmentCostSource
  quoteDate: string | null
  supplierNames: string[]
  supplierCosts: number[]
  costDivergence: number | null
  createdAt: Timestamp
  updatedAt: Timestamp
}
