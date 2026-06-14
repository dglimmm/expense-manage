import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'

/**
 * 홈 대시보드 로딩 UI
 * page.tsx의 카드 3개 그리드 레이아웃을 동일하게 모사한 스켈레톤을 표시한다.
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold">연간 지출 대시보드</h1>
          <p className="text-muted-foreground mt-2">
            올해 지출 내역을 한눈에 확인하세요.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-muted-foreground text-sm font-medium">
                    <Skeleton className="h-4 w-24" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
