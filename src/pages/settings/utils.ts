import type { TMarginTolerance } from '@/models/settings-model/types'

export const buildDepartmentOrder = (
  departments: string[],
  savedOrder: string[]
): string[] => {
  const known = savedOrder.filter((department) =>
    departments.includes(department)
  )
  const unknown = departments
    .filter((department) => !savedOrder.includes(department))
    .toSorted((a, b) => a.localeCompare(b, 'pt-BR'))

  return [...known, ...unknown]
}

export type TDepartmentMarginOverrideRow = {
  departmentId: string
  tolerance: TMarginTolerance
}

export const toDepartmentOverrideRows = (
  departmentMarginTolerances: Record<string, TMarginTolerance>
): TDepartmentMarginOverrideRow[] =>
  Object.entries(departmentMarginTolerances).map(
    ([departmentId, tolerance]) => ({ departmentId, tolerance })
  )

export const fromDepartmentOverrideRows = (
  rows: TDepartmentMarginOverrideRow[]
): Record<string, TMarginTolerance> =>
  Object.fromEntries(rows.map((row) => [row.departmentId, row.tolerance]))

export const serializeDepartmentOverrideRows = (
  rows: TDepartmentMarginOverrideRow[]
): string =>
  rows
    .toSorted((a, b) => a.departmentId.localeCompare(b.departmentId))
    .map(
      (row) =>
        `${row.departmentId}:${row.tolerance.below}:${row.tolerance.above}`
    )
    .join('|')
