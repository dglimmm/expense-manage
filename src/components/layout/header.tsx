import Link from 'next/link'
import { LayoutDashboard, Receipt } from 'lucide-react'
import { Container } from './container'
import { ThemeToggle } from '@/components/theme-toggle'

const navItems = [
  { href: '/', label: '대시보드', icon: LayoutDashboard },
  { href: '/expenses', label: '지출 내역', icon: Receipt },
]

export function Header() {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">개인 비용 관리</span>
          </Link>

          <div className="flex items-center gap-1">
            <nav className="flex items-center gap-1">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-muted-foreground hover:text-foreground hover:bg-accent flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              ))}
            </nav>

            <ThemeToggle />
          </div>
        </div>
      </Container>
    </header>
  )
}
