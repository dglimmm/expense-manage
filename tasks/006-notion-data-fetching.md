# Task 006: 비용 목록 조회 및 날짜 필터링 구현 (Notion 연동)

## 개요

Task 005에서 준비된 Notion 연동 환경을 사용해 더미 데이터(`src/lib/mock/expenses.ts`)를 실제 Notion 데이터베이스 조회로 교체한다. Notion API 2025-09-03 버전부터 데이터베이스 조회가 data source 단위로 이루어지는 점을 반영해 `src/lib/notion/queries.ts`/`mappers.ts`를 작성하고, 서버 전용 데이터 조회와 클라이언트 순수 필터링을 분리하기 위해 `src/lib/expense-filter.ts`를 신규 작성한다.

## 현재 상태 분석

- `src/app/page.tsx`, `src/app/expenses/page.tsx`, `expense-filter-table.tsx`가 `src/lib/mock/expenses.ts`의 `getMockExpenses`/`getAvailableYears`/`getAvailableMonths`를 사용 중
- `@notionhq/client`(v5.22.0)는 새 데이터 모델을 사용해 `databases.query`가 제거되고 `dataSources.query`로 대체됨. 데이터베이스의 `data_sources[0].id`를 먼저 조회해야 함
- `src/types/expense.ts`에 `Expense`, `ExpenseDateFilter`, `NotionExpensePage`, `MapNotionPageToExpense` 타입이 이미 정의되어 있음
- 실제 Notion 데이터베이스(필드: `content`, `category`, `useDate`, `cost`)에 날짜(`useDate`)가 비어있는 빈 행이 존재함(CSV 내보내기로 확인)

## 관련 파일

- `src/lib/notion/queries.ts` (신규)
- `src/lib/notion/mappers.ts` (신규)
- `src/lib/expense-filter.ts` (신규)
- `src/app/page.tsx` (수정)
- `src/app/expenses/page.tsx` (수정)
- `src/app/expenses/expense-filter-table.tsx` (수정)
- `src/lib/mock/expenses.ts` (삭제)
- `shrimp-rules.md` (수정)

## 수락 기준

- [x] `/` 접속 시 실제 Notion 데이터 기준 연간 지출 요약 Card 3개가 표시됨
- [x] `/expenses` 접속 시 실제 Notion 데이터 전체 목록이 테이블로 렌더링됨
- [x] 연/월 Select 필터가 `filterExpensesByDate`로 정상 동작함
- [x] `useDate`가 비어있는 Notion 행은 목록/필터에서 제외됨 (React key 경고 없음)
- [x] `src/lib/mock/expenses.ts`가 삭제되고 다른 곳에서 참조되지 않음
- [x] `npm run check-all`, `npm run build` 통과

## 구현 단계

1. `src/lib/notion/mappers.ts`: `NotionExpensePage` → `Expense` 매퍼 (`mapNotionPageToExpense`), 속성 누락 시 기본값(`''`, `0`) 처리
2. `src/lib/notion/queries.ts`: `Client` 초기화, `databases.retrieve`로 `data_sources[0].id` 조회 후 `dataSources.query`로 전체 비용 항목 조회, `useDate`가 빈 문자열인 항목은 제외
3. `src/lib/expense-filter.ts`: `parseUseDate`/`filterExpensesByDate`/`getAvailableYears`/`getAvailableMonths`를 mock에서 이전해 서버/클라이언트 공용화
4. `src/app/page.tsx`, `src/app/expenses/page.tsx`를 async 서버 컴포넌트로 전환, `getExpenses()` 사용
5. `expense-filter-table.tsx`: `getMockExpenses` 대신 `filterExpensesByDate`/`getAvailableYears`/`getAvailableMonths` 사용, `filteredExpenses`는 props로 받은 `expenses`를 클라이언트에서 필터링
6. `src/lib/mock/expenses.ts` 삭제 (참조 없음을 grep으로 확인)
7. `shrimp-rules.md` 디렉터리 배치 규칙 표에 `src/lib/notion/mappers.ts`, `src/lib/expense-filter.ts` 추가, `더미 데이터` 행 제거
8. `npm run check-all`, `npm run build`
9. Playwright MCP로 `/`, `/expenses` 실제 데이터 렌더링 및 연/월 필터 동작 확인

## 테스트 체크리스트

> Notion 연동 및 필터링 로직 변경이므로 Playwright MCP로 실제 데이터 기준 검증한다.

- [x] `/` 접속 시 연간 지출 요약 Card 3개가 실제 Notion 데이터 기준(93,000원 / 16,000원 / 2건)으로 표시됨
- [x] `/expenses` 접속 시 `useDate`가 있는 항목 2건이 테이블로 렌더링되고, `useDate`가 비어있는 빈 행은 표시되지 않음
- [x] 연도 Select에서 "2026년" 선택 시 테이블이 정상 갱신됨 (현재 데이터는 전부 2026년이라 행 수 동일하나 필터 적용 자체가 정상 동작함을 확인)
- [x] 콘솔에 React key 관련 에러/경고가 없음

## 변경 사항 요약

- `src/lib/notion/mappers.ts` 신규: `MapNotionPageToExpense` 타입을 구현한 `mapNotionPageToExpense`. `content.title[0]?.plain_text`, `category.select?.name`, `useDate.date?.start`, `cost.number`를 각각 기본값(`''`/`0`)과 함께 추출
- `src/lib/notion/queries.ts` 신규: `@notionhq/client`의 `Client`를 `env.NOTION_API_KEY`로 초기화. Notion API 2025-09-03부터 `databases.query`가 제거되어 `databases.retrieve`로 `data_sources[0].id`를 조회한 뒤 `dataSources.query({ data_source_id, sorts: [{ property: 'useDate', direction: 'descending' }] })`로 전체 목록을 조회. `useDate === ''`인 항목(빈 placeholder 행)은 결과에서 제외
- `src/lib/expense-filter.ts` 신규: `src/lib/mock/expenses.ts`의 `parseUseDate`/필터 로직/`getAvailableYears`/`getAvailableMonths`를 그대로 이전해 `Expense[]`를 입력으로 받는 공용 순수 함수로 일반화 (`filterExpensesByDate`로 이름 변경)
- `src/app/page.tsx`: `async function Home()`으로 전환, `getExpenses()`로 실제 Notion 데이터 조회 후 연간/이번 달 지출 요약 계산 (계산 로직 자체는 변경 없음)
- `src/app/expenses/page.tsx`: `async function ExpensesPage()`으로 전환, `getExpenses()` 사용
- `src/app/expenses/expense-filter-table.tsx`: `getMockExpenses` import 제거, `src/lib/expense-filter.ts`의 `filterExpensesByDate`/`getAvailableYears`/`getAvailableMonths` 사용. `filteredExpenses`는 `useMemo(() => filterExpensesByDate(expenses, { year, month }), [expenses, year, month])`로 props 기반 클라이언트 필터링
- `src/lib/mock/expenses.ts` 및 `src/lib/mock/` 디렉터리 삭제 (다른 참조 없음을 grep으로 확인)
- `shrimp-rules.md`: 디렉터리 배치 규칙 표에서 `더미 데이터` 행을 제거하고 `Notion 응답 → 도메인 모델 매퍼`를 `src/lib/notion/mappers.ts`로 구체화, `날짜 필터링 공용 순수 함수 → src/lib/expense-filter.ts` 행 추가
- `npm run check-all`, `npm run build` 통과 확인 (`/`는 빌드 시점 Notion 데이터로 정적 생성됨, `/api/export`는 동적 라우트)
- Playwright MCP로 검증:
  - `/` 접속 시 연간 지출 요약 Card 3개가 "93,000원"(연간 총 지출), "16,000원"(이번 달 지출), "2건"(총 건수)으로 정상 표시됨
  - `/expenses` 접속 시 실제 데이터 2건(2026.06.12 야근식대/베지밀 고단백/16,000원, 2026.05.06 교육훈련비/김영한의 실전자바 -중급 2편/77,000원)이 테이블로 렌더링됨
  - 최초 구현 시 `useDate`가 빈 Notion 행이 그대로 노출되어 `getAvailableMonths`에 `undefined`가 포함되어 React key 경고가 발생함을 발견 → `getExpenses()`에서 `useDate === ''`인 항목을 제외하도록 수정해 해결, 재검증 시 콘솔 에러 없음
  - 연도 Select에서 "2026년" 선택 시 필터링이 정상 동작함
