import { type TFamily } from '@/models'

export const filterFamilies = (search: string, families: TFamily[]) => {
  const lower = search.toLowerCase()
  return families.filter((f) => f.description.toLowerCase().includes(lower))
}
