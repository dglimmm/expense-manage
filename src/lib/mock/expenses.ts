import { Expense, ExpenseDateFilter } from '@/types/expense'

/**
 * Task 004(전체 페이지 UI 구현)에서 사용할 더미 비용 데이터
 *
 * 최근 약 11개월(2025년 8월 ~ 2026년 6월)에 걸친 데이터를 포함한다.
 * category 값은 Notion Select 필드에서 자주 사용되는 일반적인 예시 값이다.
 */
export const mockExpenses: Expense[] = [
  {
    id: 'mock-1',
    content: '점심 식사',
    category: '식비',
    useDate: '2025-08-03',
    cost: 12000,
  },
  {
    id: 'mock-2',
    content: '지하철 충전',
    category: '교통',
    useDate: '2025-08-07',
    cost: 30000,
  },
  {
    id: 'mock-3',
    content: '월세',
    category: '주거',
    useDate: '2025-08-10',
    cost: 550000,
  },
  {
    id: 'mock-4',
    content: '편의점 간식',
    category: '기타',
    useDate: '2025-08-21',
    cost: 4500,
  },
  {
    id: 'mock-5',
    content: '온라인 쇼핑몰 의류 구매',
    category: '쇼핑',
    useDate: '2025-09-02',
    cost: 89000,
  },
  {
    id: 'mock-6',
    content: '저녁 회식',
    category: '식비',
    useDate: '2025-09-12',
    cost: 35000,
  },
  {
    id: 'mock-7',
    content: '택시비',
    category: '교통',
    useDate: '2025-09-18',
    cost: 15000,
  },
  {
    id: 'mock-8',
    content: '전기 요금',
    category: '주거',
    useDate: '2025-09-25',
    cost: 62000,
  },
  {
    id: 'mock-9',
    content: '커피',
    category: '식비',
    useDate: '2025-10-04',
    cost: 4800,
  },
  {
    id: 'mock-10',
    content: '도서 구매',
    category: '쇼핑',
    useDate: '2025-10-09',
    cost: 27000,
  },
  {
    id: 'mock-11',
    content: '버스 요금',
    category: '교통',
    useDate: '2025-10-15',
    cost: 1500,
  },
  {
    id: 'mock-12',
    content: '인터넷 요금',
    category: '주거',
    useDate: '2025-10-23',
    cost: 38000,
  },
  {
    id: 'mock-13',
    content: '병원 진료비',
    category: '기타',
    useDate: '2025-11-05',
    cost: 18000,
  },
  {
    id: 'mock-14',
    content: '저녁 식사',
    category: '식비',
    useDate: '2025-11-11',
    cost: 21000,
  },
  {
    id: 'mock-15',
    content: '주유비',
    category: '교통',
    useDate: '2025-11-19',
    cost: 70000,
  },
  {
    id: 'mock-16',
    content: '겨울 외투 구매',
    category: '쇼핑',
    useDate: '2025-11-28',
    cost: 145000,
  },
  {
    id: 'mock-17',
    content: '관리비',
    category: '주거',
    useDate: '2025-12-05',
    cost: 95000,
  },
  {
    id: 'mock-18',
    content: '카페 디저트',
    category: '식비',
    useDate: '2025-12-13',
    cost: 9000,
  },
  {
    id: 'mock-19',
    content: '연말 모임 선물',
    category: '기타',
    useDate: '2025-12-24',
    cost: 50000,
  },
  {
    id: 'mock-20',
    content: 'KTX 왕복권',
    category: '교통',
    useDate: '2025-12-30',
    cost: 59800,
  },
  {
    id: 'mock-21',
    content: '신년 외식',
    category: '식비',
    useDate: '2026-01-01',
    cost: 48000,
  },
  {
    id: 'mock-22',
    content: '가스 요금',
    category: '주거',
    useDate: '2026-01-14',
    cost: 41000,
  },
  {
    id: 'mock-23',
    content: '운동화 구매',
    category: '쇼핑',
    useDate: '2026-01-22',
    cost: 119000,
  },
  {
    id: 'mock-24',
    content: '점심 식사',
    category: '식비',
    useDate: '2026-02-06',
    cost: 11000,
  },
  {
    id: 'mock-25',
    content: '지하철 충전',
    category: '교통',
    useDate: '2026-02-17',
    cost: 30000,
  },
  {
    id: 'mock-26',
    content: '월세',
    category: '주거',
    useDate: '2026-03-10',
    cost: 550000,
  },
  {
    id: 'mock-27',
    content: '생일 선물',
    category: '기타',
    useDate: '2026-03-20',
    cost: 60000,
  },
  {
    id: 'mock-28',
    content: '저녁 식사',
    category: '식비',
    useDate: '2026-04-08',
    cost: 25000,
  },
  {
    id: 'mock-29',
    content: '택시비',
    category: '교통',
    useDate: '2026-05-02',
    cost: 13500,
  },
  {
    id: 'mock-30',
    content: '온라인 쇼핑몰 생활용품 구매',
    category: '쇼핑',
    useDate: '2026-06-09',
    cost: 32000,
  },
]

/**
 * useDate(yyyy-mm-dd)를 연/월/일로 분리한다.
 */
function parseUseDate(useDate: string): {
  year: number
  month: number
  day: number
} {
  const [year, month, day] = useDate.split('-').map(Number)
  return { year, month, day }
}

/**
 * 날짜 필터(연/월/일)에 따라 mockExpenses를 필터링한다.
 *
 * filter가 없거나 모든 필드가 비어 있으면 전체 목록을 반환한다.
 */
export function getMockExpenses(filter?: ExpenseDateFilter): Expense[] {
  if (!filter || (!filter.year && !filter.month && !filter.day)) {
    return mockExpenses
  }

  return mockExpenses.filter(expense => {
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
