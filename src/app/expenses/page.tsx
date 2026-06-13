import { ExpenseFilterTable } from '@/app/expenses/expense-filter-table'
import { getExpenses } from '@/lib/notion/queries'

export default async function ExpensesPage() {
  const expenses = await getExpenses()

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">지출 내역</h1>
      <p className="text-muted-foreground mt-2">
        기간을 선택해 지출 목록을 조회하고 엑셀로 다운로드할 수 있습니다.
      </p>

      <ExpenseFilterTable expenses={expenses} />
    </div>
  )
}
