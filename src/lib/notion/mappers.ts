import { MapNotionPageToExpense } from '@/types/expense'

/**
 * Notion 페이지 응답을 Expense 도메인 모델로 변환한다.
 * 속성이 비어있는 경우(content 미입력, category 미선택 등)를 대비해 기본값을 둔다.
 */
export const mapNotionPageToExpense: MapNotionPageToExpense = page => ({
  id: page.id,
  content: page.properties.content.title[0]?.plain_text ?? '',
  category: page.properties.category.select?.name ?? '',
  useDate: page.properties.useDate.date?.start ?? '',
  cost: page.properties.cost.number ?? 0,
})
