# Task 003: 공통 컴포넌트 및 더미 데이터 준비

## 개요

Task 004(전체 페이지 UI 구현)에서 곧바로 사용할 수 있도록 shadcn UI 컴포넌트, 더미 비용 데이터, 포맷 유틸리티를 미리 준비한다. Phase 1에서 정의된 `Expense`/`ExpenseDateFilter` 타입(`src/types/expense.ts`)을 기반으로 한다.

## 현재 상태 분석

- `src/components/ui/`에 `button`, `card`, `dropdown-menu`, `sonner`만 설치되어 있고 `table`, `select`, `badge`는 없음
- `src/lib/`에는 `cn` 헬퍼(`utils.ts`)만 존재하며, 화폐/날짜 포맷 유틸이나 더미 데이터 모듈은 없음
- `/expenses` 페이지와 홈 대시보드는 골격만 있고 실제 데이터 렌더링은 Task 004에서 진행됨

## 관련 파일

- `src/components/ui/table.tsx` (신규, shadcn CLI로 생성)
- `src/components/ui/select.tsx` (신규, shadcn CLI로 생성)
- `src/components/ui/badge.tsx` (신규, shadcn CLI로 생성)
- `src/lib/mock/expenses.ts` (신규)
- `src/lib/format.ts` (신규)

## 수락 기준

- [x] shadcn table/select/badge 컴포넌트가 `src/components/ui/`에 생성됨
- [x] `src/lib/mock/expenses.ts`가 20건 이상의 `Expense[]` 더미 데이터와 `getMockExpenses(필터)` 함수를 export함
- [x] `src/lib/format.ts`가 `formatCurrency`/`formatDate`를 export함
- [x] `npm run check-all` 통과

## 구현 단계

1. `npx shadcn@latest add table select badge` 실행하여 Task 004에서 필요한 UI 컴포넌트를 `src/components/ui/`에 설치
2. `src/lib/mock/expenses.ts` 작성
   - `mockExpenses: Expense[]` — 2025년 8월부터 2026년 6월까지 약 11개월에 걸친 30건의 더미 데이터 (category: 식비/교통/주거/쇼핑/기타)
   - `getMockExpenses(filter?: ExpenseDateFilter)` — `useDate`를 연/월/일로 파싱해 `filter.year`/`filter.month`/`filter.day` 조건으로 필터링 (filter 없거나 비어있으면 전체 반환)
   - `getAvailableYears(expenses)` / `getAvailableMonths(expenses, year?)` — 연/월 Select 옵션 구성을 위한 유틸 함수
3. `src/lib/format.ts` 작성
   - `formatCurrency(amount)` — `Intl.NumberFormat('ko-KR')`로 천 단위 구분 후 "원" 접미사 추가 (예: "12,000원")
   - `formatDate(dateStr)` — ISO 날짜 문자열(yyyy-mm-dd)을 "yyyy.mm.dd" 형식으로 변환 (예: "2026.03.05")
4. `npm run check-all` 실행으로 typecheck/lint/format 검증

## 변경 사항 요약

- shadcn CLI로 `src/components/ui/table.tsx`, `src/components/ui/select.tsx`, `src/components/ui/badge.tsx` 신규 생성 (new-york 스타일, `@radix-ui/react-select` 등 관련 의존성 자동 설치)
- `src/lib/mock/expenses.ts` 신규 생성: 2025-08-03 ~ 2026-06-09 기간에 걸친 `mock-1`~`mock-30` 30건의 `Expense` 더미 데이터(category: 식비/교통/주거/쇼핑/기타), `getMockExpenses(filter?)`, `getAvailableYears(expenses)`, `getAvailableMonths(expenses, year?)`, 내부 헬퍼 `parseUseDate` 구현
- `src/lib/format.ts` 신규 생성: `formatCurrency(amount)`(예: `12000` → `"12,000원"`), `formatDate(dateStr)`(예: `"2026-03-05"` → `"2026.03.05"`) 구현
- `npm run check-all` 통과 확인 (typecheck/lint 통과, format:check은 본 작업과 무관한 기존 비추적 파일 `shrimp_data/tasks.json`만 경고)
- UI 페이지(`src/app/page.tsx`, `src/app/expenses/page.tsx`)는 수정하지 않음 (Task 004에서 진행)
