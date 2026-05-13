import { type TSeller } from '@/models'

export const filterSellers = (search: string, sellers: TSeller[]) => {
  const lower = search.toLowerCase()
  return sellers.filter(
    (s) =>
      s.name.toLowerCase().includes(lower) ||
      s.phone?.toLowerCase().includes(lower)
  )
}
