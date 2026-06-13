import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold">연간 지출 대시보드</h1>
        </div>
      </main>
      <Footer />
    </div>
  )
}
