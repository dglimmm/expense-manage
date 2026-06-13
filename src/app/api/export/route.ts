import { NextRequest, NextResponse } from 'next/server'

import { buildExpenseWorkbook } from '@/lib/excel/build-workbook'
import { filterExpensesByDate } from '@/lib/expense-filter'
import { formatDateForFilename } from '@/lib/format'
import { getExpenses } from '@/lib/notion/queries'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const year = searchParams.get('year')
  const month = searchParams.get('month')

  const expenses = filterExpensesByDate(await getExpenses(), {
    year: year ? Number(year) : undefined,
    month: month ? Number(month) : undefined,
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
}
