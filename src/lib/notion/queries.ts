import { Client, isFullDatabase } from '@notionhq/client'

import { env } from '@/lib/env'
import { mapNotionPageToExpense } from '@/lib/notion/mappers'
import { Expense, NotionExpensePage } from '@/types/expense'

const notion = new Client({ auth: env.NOTION_API_KEY })

/**
 * Notion API 2025-09-03 버전부터 데이터베이스 조회는 data source 단위로 이루어진다.
 * NOTION_DATABASE_ID로 데이터베이스를 조회해 첫 번째 data source의 id를 구한다.
 */
async function getDataSourceId(): Promise<string> {
  const database = await notion.databases.retrieve({
    database_id: env.NOTION_DATABASE_ID,
  })

  if (!isFullDatabase(database) || database.data_sources.length === 0) {
    throw new Error('Notion 데이터베이스에서 data source를 찾을 수 없습니다.')
  }

  return database.data_sources[0].id
}

/**
 * Notion 데이터베이스에서 전체 비용 항목을 조회해 Expense 목록으로 변환한다.
 * 날짜별 필터링은 src/lib/expense-filter.ts의 순수 함수로 별도 처리한다.
 */
export async function getExpenses(): Promise<Expense[]> {
  const dataSourceId = await getDataSourceId()

  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
    sorts: [{ property: 'useDate', direction: 'descending' }],
  })

  return response.results
    .map(page => mapNotionPageToExpense(page as unknown as NotionExpensePage))
    .filter(expense => expense.useDate !== '')
}
