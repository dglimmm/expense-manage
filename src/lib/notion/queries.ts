import { Client, isFullDatabase } from '@notionhq/client'
import { unstable_cache } from 'next/cache'

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
 * 실제 Notion API 호출(데이터소스 조회 포함) 부분.
 */
async function fetchExpensesFromNotion(): Promise<Expense[]> {
  const dataSourceId = await getDataSourceId()

  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
    sorts: [{ property: 'useDate', direction: 'descending' }],
  })

  return response.results
    .map(page => mapNotionPageToExpense(page as unknown as NotionExpensePage))
    .filter(expense => expense.useDate !== '')
}

/**
 * fetchExpensesFromNotion을 60초(revalidate: 60) 동안 캐싱한다.
 * 개인용 단일 사용자 앱이므로 60초 정도의 staleness는 허용 가능하며,
 * getDataSourceId() 호출(데이터베이스 조회)도 캐시 범위에 포함되어 함께 캐싱된다.
 */
const getCachedExpenses = unstable_cache(
  fetchExpensesFromNotion,
  ['expenses'],
  {
    revalidate: 60,
  }
)

/**
 * Notion 데이터베이스에서 전체 비용 항목을 조회해 Expense 목록으로 반환한다.
 * 결과는 60초간 캐싱된다 (unstable_cache). 날짜별 필터링은
 * src/lib/expense-filter.ts의 순수 함수로 별도 처리한다.
 */
export async function getExpenses(): Promise<Expense[]> {
  return getCachedExpenses()
}
