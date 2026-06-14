'use client'

import { Button } from '@/components/ui/button'

/**
 * 지출 내역 페이지 에러 바운더리
 * Notion API 조회 실패 등 데이터 로딩 중 발생한 오류를 사용자에게 안내하고
 * "다시 시도" 버튼으로 페이지를 재시도할 수 있게 한다.
 */
export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <h2 className="text-2xl font-bold">지출 내역을 불러오지 못했습니다</h2>
      <p className="text-muted-foreground">
        잠시 후 다시 시도해 주세요. 문제가 계속되면 Notion 연동 설정을 확인해
        주세요.
      </p>
      <Button onClick={reset} aria-label="지출 내역 다시 시도">
        다시 시도
      </Button>
    </div>
  )
}
