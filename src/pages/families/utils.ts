import { type TFamily } from '@/models/family-model/types'
import { matchesSearch } from '@/utils/search'

export const filterFamilies = (search: string, families: TFamily[]) =>
  families.filter((f) => matchesSearch(search, f.description))
