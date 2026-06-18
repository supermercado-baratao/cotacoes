import { type TFamily } from '@/models'
import { matchesSearch } from '@/utils'

export const filterFamilies = (search: string, families: TFamily[]) =>
  families.filter((f) => matchesSearch(search, f.description))
