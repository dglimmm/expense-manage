import { Expense, ExpenseDateFilter } from '@/types/expense'

/**
 * useDate(yyyy-mm-dd)를 연/월/일로 분리한다.
 */
export function parseUseDate(useDate: string): {
  year: number
  month: number
  day: number
} {
  const [year, month, day] = useDate.split('-').map(Number)
  return { year, month, day }
}

/**
 * 날짜 필터(연/월/일)에 따라 비용 목록을 필터링한다.
 *
 * filter가 없거나 모든 필드가 비어 있으면 전체 목록을 반환한다.
 */
export function filterExpensesByDate(
  expenses: Expense[],
  filter?: ExpenseDateFilter
): Expense[] {
  if (!filter || (!filter.year && !filter.month && !filter.day)) {
    return expenses
  }

  return expenses.filter(expense => {
    const { year, month, day } = parseUseDate(expense.useDate)

    if (filter.year && year !== filter.year) return false
    if (filter.month && month !== filter.month) return false
    if (filter.day && day !== filter.day) return false

    return true
  })
}

/**
 * 비용 목록에 존재하는 연도 목록을 내림차순으로 반환한다 (연도 Select 옵션용).
 */
export function getAvailableYears(expenses: Expense[]): number[] {
  const years = new Set<number>()

  for (const expense of expenses) {
    years.add(parseUseDate(expense.useDate).year)
  }

  return Array.from(years).sort((a, b) => b - a)
}

/**
 * 비용 목록에 존재하는 월 목록을 오름차순으로 반환한다 (월 Select 옵션용).
 *
 * year가 주어지면 해당 연도에 속한 월만 반환한다.
 */
export function getAvailableMonths(
  expenses: Expense[],
  year?: number
): number[] {
  const months = new Set<number>()

  for (const expense of expenses) {
    const parsed = parseUseDate(expense.useDate)

    if (year && parsed.year !== year) continue

    months.add(parsed.month)
  }

  return Array.from(months).sort((a, b) => a - b)
}
