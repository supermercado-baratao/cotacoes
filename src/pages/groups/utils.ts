import type { TGroup } from '@/models'

export const filterGroups = (search: string, groups: TGroup[]) => {
  const lower = search.toLowerCase()
  return groups.filter((g) => g.description.toLowerCase().includes(lower))
}
