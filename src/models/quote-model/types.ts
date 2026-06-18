import { Timestamp } from 'firebase/firestore'

export type TQuoteStatus = 'opened' | 'closed'

export type TQuoteItem = {
  id: string
  description: string
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
