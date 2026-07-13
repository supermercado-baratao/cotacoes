export const buildDepartmentOrder = (
  departments: string[],
  savedOrder: string[]
): string[] => {
  const known = savedOrder.filter((department) =>
    departments.includes(department)
  )
  const unknown = departments
    .filter((department) => !savedOrder.includes(department))
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))

  return [...known, ...unknown]
}
