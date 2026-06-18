import { Timestamp } from 'firebase/firestore'

export type TQuoteStatus = 'opened' | 'closed'

export type TPriceRef =
  | { type: 'family'; id: string }
  | { type: 'product'; id: string }
  | { type: 'manual' }
  | null

export type TQuoteItem = {
  id: string
  description: string
  salePrice: number | null
  priceRef: TPriceRef
}

export type TQuote = {
  id: string
  items: TQuoteItem[]
  orders: string[]
  status: TQuoteStatus
  date: string
  observations: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
}
