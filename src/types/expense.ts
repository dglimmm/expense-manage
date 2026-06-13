/**
 * 비용 항목 도메인 모델 (PRD 4절 Notion 데이터베이스 필드 기반)
 */
export interface Expense {
  id: string
  content: string
  category: string
  /** ISO 8601 날짜 문자열 (yyyy-mm-dd) */
  useDate: string
  cost: number
}

/**
 * 연/월/일 단위 날짜 필터 (PRD 2절 "날짜별 필터링")
 */
export interface ExpenseDateFilter {
  year?: number
  month?: number
  day?: number
}

/**
 * 엑셀 템플릿의 데이터 영역 셀 매핑 계약 (PRD 8.3절)
 */
export interface ExcelCellMapping {
  startCell: string
  columns: Record<'useDate' | 'category' | 'content' | 'cost', string>
}

/**
 * PRD 8.3절 셀 매핑 계약을 코드로 반영한 SSOT.
 * 실제 템플릿(src/lib/templates/expense-template.xlsx)의 데이터 영역은 A10부터 시작하며,
 * C:D는 "상세 내역"으로 병합되어 있고 "금액"은 E열이다(F열은 "비고"로 데이터 매핑 대상이 아님).
 * 실제 템플릿 양식 변경 시 PRD 8.3절과 함께 갱신한다.
 */
export const EXPENSE_EXCEL_CELL_MAPPING: ExcelCellMapping = {
  startCell: 'A10',
  columns: {
    useDate: 'A',
    category: 'B',
    content: 'C',
    cost: 'E',
  },
}

/**
 * Notion 페이지 properties 구조 (Notion API PageObjectResponse.properties를 본뜬 최소 타입)
 */
export interface NotionExpenseProperties {
  content: { title: { plain_text: string }[] }
  category: { select: { name: string } | null }
  useDate: { date: { start: string } | null }
  cost: { number: number | null }
}

/**
 * Notion 데이터베이스의 비용 항목 페이지 응답 구조
 */
export interface NotionExpensePage {
  id: string
  properties: NotionExpenseProperties
}

/**
 * Notion 페이지 응답 → Expense 도메인 모델 변환 함수 타입 (구현은 Task 006)
 */
export type MapNotionPageToExpense = (page: NotionExpensePage) => Expense
