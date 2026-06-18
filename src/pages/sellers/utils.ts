import { type TSeller } from '@/models'
import { matchesSearch } from '@/utils'

export const filterSellers = (search: string, sellers: TSeller[]) =>
  sellers.filter((s) => matchesSearch(search, s.name, s.phone))
