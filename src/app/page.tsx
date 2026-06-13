import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { formatCurrency } from '@/lib/format'
import { getMockExpenses } from '@/lib/mock/expenses'

export default function Home() {
  // 전체 더미 데이터를 가져와 연간/이번 달 지출 요약을 계산한다
  const expenses = getMockExpenses()

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const yearlyExpenses = expenses.filter(expense => {
    const [year] = expense.useDate.split('-').map(Number)
    return year === currentYear
  })

  const monthlyExpenses = yearlyExpenses.filter(expense => {
    const [, month] = expense.useDate.split('-').map(Number)
    return month === currentMonth
  })

  const yearlyTotal = yearlyExpenses.reduce(
    (sum, expense) => sum + expense.cost,
    0
  )
  const monthlyTotal = monthlyExpenses.reduce(
    (sum, expense) => sum + expense.cost,
    0
  )
  const yearlyCount = yearlyExpenses.length

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold">연간 지출 대시보드</h1>
          <p className="text-muted-foreground mt-2">
            올해 지출 내역을 한눈에 확인하세요.
          </p>

          {/* 연간 지출 요약 */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  연간 총 지출
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(yearlyTotal)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  이번 달 지출
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(monthlyTotal)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  총 건수
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{yearlyCount}건</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
