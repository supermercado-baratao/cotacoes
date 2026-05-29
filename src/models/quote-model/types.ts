export type TQuoteStatus = 'opened' | 'closed'

export type TQuote = {
  id: string
  products: string[]
  orders: string[]
  status: TQuoteStatus
  date: string
  observations: string | null
  createdAt: number
  updatedAt: number
}
