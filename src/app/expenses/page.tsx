import { ExpenseFilterTable } from '@/app/expenses/expense-filter-table'
import { logError } from '@/lib/logger'
import { getExpenses } from '@/lib/notion/queries'

export default async function ExpensesPage() {
  // 조회 실패 시 로그를 남기고 다시 throw하여 app/expenses/error.tsx가 처리하도록 한다.
  let expenses
  try {
    expenses = await getExpenses()
  } catch (e) {
    logError('expenses/getExpenses', e)
    throw e
  }

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
