import { type TSeller } from '@/models/seller-model/types'
import { matchesSearch } from '@/utils/search'

export const filterSellers = (search: string, sellers: TSeller[]) =>
  sellers.filter((s) => matchesSearch(search, s.name, s.phone))
