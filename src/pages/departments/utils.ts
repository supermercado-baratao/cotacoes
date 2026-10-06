import { type TDepartment } from '@/models/department-model/types'
import { matchesSearch } from '@/utils/search'

export const filterDepartments = (search: string, departments: TDepartment[]) =>
  departments.filter((d) => matchesSearch(search, d.description))
