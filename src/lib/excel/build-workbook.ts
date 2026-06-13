import path from 'path'

import XlsxPopulate from 'xlsx-populate'

import { EXPENSE_EXCEL_CELL_MAPPING, Expense } from '@/types/expense'

const TEMPLATE_PATH = path.join(
  process.cwd(),
  'src/lib/templates/expense-template.xlsx'
)

/**
 * "yyyy-mm-dd" 형식의 useDate를 로컬 타임존 기준 자정의 Date로 변환한다.
 * `new Date(isoString)`은 UTC 자정으로 파싱되어 xlsx-populate의 로컬 타임존 기반
 * 날짜-숫자 변환 시 시간 오프셋(예: KST에서 0.375일)이 생기는 문제를 방지한다.
 */
function parseUseDateAsLocalDate(useDate: string): Date {
  const [year, month, day] = useDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** F7(신청일) 셀의 기존 텍스트 형식("yyyy m. d")에 맞춰 오늘 날짜를 포맷한다. */
function formatApplicationDate(date: Date): string {
  return `${date.getFullYear()} ${date.getMonth() + 1}. ${date.getDate()}`
}

/**
 * 기존 지출결의서 엑셀 양식(헤더/합계 등 정적 영역)을 그대로 유지한 채,
 * F7(신청일)에는 오늘 날짜를 채우고, EXPENSE_EXCEL_CELL_MAPPING에 따라
 * 데이터 영역(A10~)만 채워 워크북 버퍼를 생성한다.
 */
export async function buildExpenseWorkbook(
  expenses: Expense[]
): Promise<Buffer> {
  const workbook = await XlsxPopulate.fromFileAsync(TEMPLATE_PATH)
  const sheet = workbook.sheet(0)
  const { startCell, columns } = EXPENSE_EXCEL_CELL_MAPPING
  const startRow = Number(startCell.match(/\d+/)?.[0])

  sheet.cell('F7').value(formatApplicationDate(new Date()))

  expenses.forEach((expense, index) => {
    const row = startRow + index
    sheet
      .cell(`${columns.useDate}${row}`)
      .value(parseUseDateAsLocalDate(expense.useDate))
    sheet.cell(`${columns.category}${row}`).value(expense.category)
    sheet.cell(`${columns.content}${row}`).value(expense.content)
    sheet.cell(`${columns.cost}${row}`).value(expense.cost)
  })

  return workbook.outputAsync()
}
