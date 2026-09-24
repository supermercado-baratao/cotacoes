import { type TDepartment } from '@/models'
import { matchesSearch } from '@/utils'

export const filterDepartments = (search: string, departments: TDepartment[]) =>
  departments.filter((d) => matchesSearch(search, d.description))
