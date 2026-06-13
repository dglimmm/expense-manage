# Task 004: 전체 페이지 UI 구현 (더미 데이터 기반)

## 개요

Task 003에서 준비된 shadcn UI 컴포넌트, 더미 비용 데이터(`mockExpenses`), 포맷 유틸리티(`formatCurrency`/`formatDate`)를 사용해 홈 대시보드(`/`)와 지출 내역(`/expenses`) 페이지의 실제 UI를 구현한다. 실제 Notion 연동과 엑셀 다운로드 로직은 Phase 3(Task 006/007)에서 진행하며, 본 작업에서는 더미 데이터 기반 화면 구성과 클라이언트 필터링 UI만 구현한다.

## 현재 상태 분석

- `src/app/page.tsx`는 서버 컴포넌트로 제목/안내문만 표시 중이며 실제 지출 요약 데이터는 렌더링하지 않음
- `src/app/expenses/page.tsx`는 제목/안내문과 Inbox 빈 상태 placeholder만 있고 실제 테이블/필터 UI는 없음
- `src/lib/mock/expenses.ts`에 `mockExpenses`(30건), `getMockExpenses(filter?)`, `getAvailableYears`, `getAvailableMonths`가 이미 구현되어 있음
- `src/lib/format.ts`에 `formatCurrency`, `formatDate`가 이미 구현되어 있음
- `src/components/ui/`에 table, select, badge, button, card, sonner 등이 이미 설치되어 있음
- `sonner`의 `Toaster`는 `src/app/layout.tsx`에 이미 마운트되어 있어 `toast(...)`를 바로 호출 가능

## 관련 파일

- `src/app/page.tsx` (수정)
- `src/app/expenses/page.tsx` (수정)
- `src/app/expenses/expense-filter-table.tsx` (신규)

## 수락 기준

- [x] `/` 접속 시 "연간 지출 요약" Card 3개(연간 총 지출, 이번 달 지출, 총 건수)가 더미 데이터 기준 값으로 표시됨
- [x] `/expenses` 접속 시 연/월 Select 필터와 지출 목록 Table이 렌더링됨
- [x] 연/월 Select 변경 시 `getMockExpenses({ year, month })`를 통해 테이블 행이 갱신됨
- [x] 조건에 맞는 데이터가 없을 때 Inbox 아이콘과 안내 문구로 빈 상태가 표시됨
- [x] "엑셀 다운로드" 버튼 클릭 시 `toast('다운로드 기능은 추후 제공됩니다')` 토스트가 표시됨 (실제 엑셀 로직은 미구현)
- [x] `npm run check-all` 통과
- [x] `npm run build` 성공

## 구현 단계

1. `src/app/page.tsx` 수정
   - `getMockExpenses()`로 전체 데이터를 가져와 현재 연도/월 기준 연간 총 지출, 이번 달 지출, 연간 총 건수를 계산
   - 기존 안내문 아래에 `grid grid-cols-1 sm:grid-cols-3 gap-4` 레이아웃으로 3개의 `Card`(연간 총 지출/이번 달 지출/총 건수) 추가, 금액은 `formatCurrency`로 표시
   - 서버 컴포넌트 유지
2. `src/app/expenses/expense-filter-table.tsx` 신규 생성 (`'use client'`)
   - `expenses: Expense[]` props 수신
   - `useState`로 `year`/`month` 필터 상태 관리 (둘 다 `undefined` = 전체)
   - `getAvailableYears(expenses)`/`getAvailableMonths(expenses, year)`로 Select 옵션 구성, '전체 연도'/'전체 월' 옵션 포함
   - `getMockExpenses({ year, month })` 호출 결과를 `Table`로 렌더링 (날짜/카테고리(Badge)/내용/금액(우측 정렬))
   - 우측 영역에 "엑셀 다운로드" `Button` 배치, `onClick`에서 `toast('다운로드 기능은 추후 제공됩니다')`만 호출
   - 필터링 결과 0건일 때 Inbox 아이콘 + "조건에 맞는 데이터가 없습니다." 빈 상태 표시
   - `div.overflow-x-auto`로 테이블 감싸 모바일 가로 스크롤 대응, 필터 컨트롤은 `flex flex-col sm:flex-row` 반응형 처리
3. `src/app/expenses/page.tsx` 수정
   - `getMockExpenses()`로 전체 데이터를 가져와 `<ExpenseFilterTable expenses={...} />`에 전달, 기존 제목/안내문 유지
4. `npm run check-all`, `npm run build`로 검증
5. Playwright MCP로 `/`, `/expenses` 동작 확인

## 테스트 체크리스트

> UI 동작 변경이 포함되므로 Playwright MCP로 검증한다.

- [x] `/` 접속 시 연간 지출 요약 Card 3개가 더미 데이터 기준 값(연간 총 지출 929,500원, 이번 달 지출 32,000원, 총 건수 10건 — 2026년 기준)으로 표시되는지 확인
- [x] `/expenses` 접속 시 30건 전체 지출 목록 테이블이 렌더링되는지 확인
- [x] 연도 Select에서 "2025년" 선택 시 테이블이 2025년 데이터(20건)만 표시되는지 확인
- [x] "엑셀 다운로드" 버튼 클릭 시 "다운로드 기능은 추후 제공됩니다" 토스트가 표시되는지 확인
- [x] 빈 상태 UI 코드 경로(Inbox 아이콘 + "조건에 맞는 데이터가 없습니다." 문구)가 `filteredExpenses.length === 0`일 때 렌더링되도록 구현됨 (단, 현재 더미 데이터는 Select에 노출되는 모든 연/월 조합에 데이터가 존재하므로 UI 상에서 실제로 0건 상태를 트리거하는 조합은 없음 — 코드 리뷰로 확인)

## 변경 사항 요약

- `src/app/page.tsx`: `getMockExpenses()`로 전체 더미 데이터를 가져와 현재 연도 기준 연간 총 지출, 이번 달 지출, 연간 총 건수를 계산하고, 기존 안내문 아래에 `grid grid-cols-1 sm:grid-cols-3 gap-4` 레이아웃의 `Card` 3개("연간 총 지출", "이번 달 지출", "총 건수")로 표시. 금액은 `formatCurrency`로 포맷. 서버 컴포넌트 유지(`'use client'` 없음).
- `src/app/expenses/expense-filter-table.tsx` 신규 생성 (`'use client'`): `expenses: Expense[]` props를 받아 `useState`로 `year`/`month` 필터 상태 관리. `getAvailableYears`/`getAvailableMonths`로 shadcn `Select` 2개(연도/월, '전체' 옵션 포함) 구성. 연도 변경 시 월 선택을 초기화. `getMockExpenses({ year, month })` 결과를 shadcn `Table`(날짜=`formatDate`, 카테고리=`Badge` default variant, 내용, 금액=`formatCurrency` 우측 정렬)로 렌더링. 우측에 "엑셀 다운로드" `Button` 배치, `onClick`에서 `toast('다운로드 기능은 추후 제공됩니다')`만 호출(TODO 주석으로 Phase 3/Task 007 명시). 결과 0건 시 Inbox 아이콘 + "조건에 맞는 데이터가 없습니다." 빈 상태 표시. 테이블은 `overflow-x-auto`로 감싸 모바일 가로 스크롤 대응, 필터 컨트롤은 `flex flex-col sm:flex-row` 반응형.
- `src/app/expenses/page.tsx`: `getMockExpenses()`로 전체 데이터를 가져와 `<ExpenseFilterTable expenses={expenses} />`에 전달. 기존 제목/안내문 유지, 기존 Inbox 빈 상태 placeholder는 `ExpenseFilterTable` 내부 로직으로 이전.
- `npm run check-all` 통과 확인 (typecheck/lint/format 통과, `shrimp_data/tasks.json`만 본 작업과 무관한 기존 포맷 경고).
- `npm run build` 성공 확인 (`/`, `/expenses` 모두 정적 페이지로 생성됨).
- Playwright MCP로 검증:
  - `/` 접속 시 연간 지출 요약 Card 3개가 "929,500원"(연간 총 지출), "32,000원"(이번 달 지출), "10건"(총 건수)으로 정상 표시됨
  - `/expenses` 접속 시 30건 전체 테이블이 렌더링됨
  - 연도 Select에서 "2025년" 선택 시 테이블이 2025년 데이터(20건, 2025.08~2025.12)만 표시되도록 갱신됨
  - "엑셀 다운로드" 버튼 클릭 시 "다운로드 기능은 추후 제공됩니다" 토스트가 정상 표시됨
