'use client'

import { useMemo, useState } from 'react'
import { Inbox } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  filterExpensesByDate,
  getAvailableMonths,
  getAvailableYears,
} from '@/lib/expense-filter'
import { formatCurrency, formatDate } from '@/lib/format'
import { Expense } from '@/types/expense'

interface ExpenseFilterTableProps {
  expenses: Expense[]
}

/** Select에서 '전체'를 표현하기 위한 내부 값 */
const ALL_VALUE = 'all'

export function ExpenseFilterTable({ expenses }: ExpenseFilterTableProps) {
  // 연/월 필터 상태 (선택하지 않으면 undefined = 전체)
  const [year, setYear] = useState<number | undefined>(undefined)
  const [month, setMonth] = useState<number | undefined>(undefined)

  const availableYears = useMemo(() => getAvailableYears(expenses), [expenses])
  const availableMonths = useMemo(
    () => getAvailableMonths(expenses, year),
    [expenses, year]
  )

  const filteredExpenses = useMemo(
    () => filterExpensesByDate(expenses, { year, month }),
    [expenses, year, month]
  )

  const handleYearChange = (value: string) => {
    if (value === ALL_VALUE) {
      setYear(undefined)
      setMonth(undefined)
      return
    }

    setYear(Number(value))
    // 연도가 바뀌면 해당 연도에 없는 월 선택은 초기화한다
    setMonth(undefined)
  }

  const handleMonthChange = (value: string) => {
    if (value === ALL_VALUE) {
      setMonth(undefined)
      return
    }

    setMonth(Number(value))
  }

  const handleExcelDownload = () => {
    const params = new URLSearchParams()
    if (year) params.set('year', String(year))
    if (month) params.set('month', String(month))

    // /api/export가 Content-Disposition으로 파일명을 지정하므로,
    // 브라우저가 해당 URL을 직접 다운로드 처리하도록 한다.
    window.location.href = `/api/export?${params.toString()}`
  }

  return (
    <div className="mt-8 space-y-4">
      {/* 필터 컨트롤 영역 */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select
            value={year ? String(year) : ALL_VALUE}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="연도 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>전체 연도</SelectItem>
              {availableYears.map(availableYear => (
                <SelectItem key={availableYear} value={String(availableYear)}>
                  {availableYear}년
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={month ? String(month) : ALL_VALUE}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="월 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>전체 월</SelectItem>
              {availableMonths.map(availableMonth => (
                <SelectItem key={availableMonth} value={String(availableMonth)}>
                  {availableMonth}월
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleExcelDownload} className="sm:w-auto">
          엑셀 다운로드
        </Button>
      </div>

      {/* 지출 목록 테이블 또는 빈 상태 */}
      {filteredExpenses.length > 0 ? (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>날짜</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>내용</TableHead>
                <TableHead className="text-right">금액</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map(expense => (
                <TableRow key={expense.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(expense.useDate)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{expense.category}</Badge>
                  </TableCell>
                  <TableCell>{expense.content}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {formatCurrency(expense.cost)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center">
          <Inbox className="size-10" />
          <p>조건에 맞는 데이터가 없습니다.</p>
        </div>
      )}
    </div>
  )
}
