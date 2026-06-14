import { Skeleton } from '@/components/ui/skeleton'

/**
 * 지출 내역 페이지 로딩 UI
 * 필터 컨트롤(연/월 선택 + 다운로드 버튼)과 테이블 영역을 모사한 스켈레톤을 표시한다.
 */
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">지출 내역</h1>
      <p className="text-muted-foreground mt-2">
        기간을 선택해 지출 목록을 조회하고 엑셀로 다운로드할 수 있습니다.
      </p>

      <div className="mt-8 space-y-4">
        {/* 필터 컨트롤 영역 스켈레톤 */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Skeleton className="h-9 w-full sm:w-[140px]" />
            <Skeleton className="h-9 w-full sm:w-[140px]" />
          </div>
          <Skeleton className="h-9 w-full sm:w-32" />
        </div>

        {/* 테이블 영역 스켈레톤 */}
        <div className="space-y-2 rounded-md border p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
