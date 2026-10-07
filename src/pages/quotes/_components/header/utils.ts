import dayjs from 'dayjs'

export const getDaysInYearMonth = (year: number, month: number): number[] => {
  const daysInMonth = dayjs(new Date(year, month, 0)).daysInMonth()
  return Array.from({ length: daysInMonth }, (_, index) => index + 1)
}
