import { Timestamp } from 'firebase/firestore'

export type TQuoteStatus = 'opened' | 'closed'

export type TQuoteItemType = 'product' | 'family' | 'group'

export type TQuoteItem = {
  id: string
  type: TQuoteItemType
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
