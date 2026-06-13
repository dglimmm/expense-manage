/**
 * 숫자를 'ko-KR' 형식의 원화 문자열로 변환한다.
 *
 * 예: 12000 -> "12,000원"
 */
export function formatCurrency(amount: number): string {
  return `${new Intl.NumberFormat('ko-KR').format(amount)}원`
}

/**
 * ISO 8601 날짜 문자열(yyyy-mm-dd)을 "yyyy.mm.dd" 형식으로 변환한다.
 *
 * 예: "2026-03-05" -> "2026.03.05"
 */
export function formatDate(dateStr: string): string {
  return dateStr.replaceAll('-', '.')
}

/**
 * Date를 파일명에 사용할 "yyyyMMdd" 형식 문자열로 변환한다.
 *
 * 예: 2026-06-13 -> "20260613"
 */
export function formatDateForFilename(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}
