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
