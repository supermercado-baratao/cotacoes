import { type TSeller } from '@/models/seller/types'
import { matchesSearch } from '@/utils/search'

export const filterSellers = (search: string, sellers: TSeller[]) =>
  sellers.filter((s) => matchesSearch(search, s.name, s.phone))
