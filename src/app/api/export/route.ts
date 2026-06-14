import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { buildExpenseWorkbook } from '@/lib/excel/build-workbook'
import { filterExpensesByDate } from '@/lib/expense-filter'
import { formatDateForFilename } from '@/lib/format'
import { logError } from '@/lib/logger'
import { getExpenses } from '@/lib/notion/queries'
import { checkRateLimit } from '@/lib/rate-limit'

// year/month 쿼리 파라미터 검증 스키마.
// 빈 문자열(쿼리 미지정 시 searchParams.get은 null이라 optional 처리됨)은
// 호출부에서 undefined로 변환해 전달한다.
const exportQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
})

export async function GET(request: NextRequest) {
  // 클라이언트 IP(또는 첫 번째 프록시 헤더 값) 기준 best-effort rate limiting.
  // 외부 스토리지 없이 인스턴스 메모리만 사용하므로 완전한 보장은 아니다.
  const forwardedFor = request.headers.get('x-forwarded-for')
  const identifier = forwardedFor?.split(',')[0]?.trim() || 'unknown'

  const rateLimit = checkRateLimit(identifier)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(
            Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
          ),
        },
      }
    )
  }

  const { searchParams } = new URL(request.url)

  const parsedQuery = exportQuerySchema.safeParse({
    year: searchParams.get('year') ?? undefined,
    month: searchParams.get('month') ?? undefined,
  })

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: '잘못된 연도 또는 월 파라미터입니다.' },
      { status: 400 }
    )
  }

  const { year, month } = parsedQuery.data

  try {
    // getExpenses()는 60초간 캐싱되므로(unstable_cache), 다운로드 요청이
    // 짧은 시간에 여러 번 발생해도 Notion API는 60초마다 한 번만 호출된다.
    // 개인용 데이터 특성상 60초 staleness는 허용 가능하며, 응답 자체(엑셀 바이너리)는
    // 항상 새로 생성되어 Cache-Control: no-store로 캐싱되지 않는다.
    const expenses = filterExpensesByDate(await getExpenses(), {
      year,
      month,
    })

    const buffer = await buildExpenseWorkbook(expenses)
    const filename = `지출결의서_${formatDateForFilename(new Date())}.xlsx`

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        // filename(ASCII fallback)을 함께 지정해야 filename*(RFC 5987)을 지원하지 않는
        // 환경에서도 확장자가 없는 임의 파일명(UUID 등)으로 저장되지 않는다.
        'Content-Disposition': `attachment; filename="expense-report.xlsx"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (e) {
    logError('api/export', e)
    return NextResponse.json(
      { error: '엑셀 파일을 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
