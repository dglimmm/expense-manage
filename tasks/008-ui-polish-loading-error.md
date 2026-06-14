# Task 008: 스타일링 다듬기 및 사용자 경험 향상

## 개요

Phase 4 Task 008(UI 최종 다듬기, 로딩/에러 처리, 접근성)을 구현한다. 추가로 사용자 요청에 따라 ROADMAP Task 010("Notion 데이터 캐싱 전략 적용")과 Task 009("Rate limiting 구현") 중 일부 항목을 이번 작업에서 함께 앞당겨 구현한다.

- **A. UI/UX (Task 008 본래 범위)**: `loading.tsx`/`error.tsx` 추가, 접근성(aria-label) 보강, 반응형 점검
- **B. Notion API 캐싱 (Task 010 일부 앞당김)**: `getExpenses()`에 `unstable_cache` 60초 캐싱 적용
- **C. `/api/export` Rate Limiting (Task 009 일부 앞당김)**: in-memory 기반 best-effort rate limiter 적용

## 현재 상태 분석

- `src/app/page.tsx`, `src/app/expenses/page.tsx`는 서버 컴포넌트에서 `getExpenses()`를 호출하지만 try/catch가 없어 Notion API 오류 시 별도 처리 없이 throw됨
- `app` 디렉터리 전체에 `loading.tsx`/`error.tsx`/`not-found.tsx`가 없어 데이터 로딩 중 빈 화면, 오류 시 Next.js 기본 에러 화면이 노출됨
- `src/components/ui/skeleton.tsx`는 설치되어 있지 않음
- `src/lib/notion/queries.ts`의 `getExpenses()`는 호출마다 `databases.retrieve` + `dataSources.query`를 수행하며 캐싱이 없음. 시그니처는 `Promise<Expense[]>` (인자 없음)
- `src/app/api/export/route.ts`는 입력 검증/캐싱/레이트리밋이 없고, 응답 헤더에 `Cache-Control: no-store`가 설정되어 있음 (다운로드 응답 자체는 항상 최신 바이트를 클라이언트에 전달해야 하므로 유지)
- `src/app/expenses/expense-filter-table.tsx`는 `window.location.href`로 다운로드하며 sonner(`toast`)는 설치되어 있으나 다운로드 흐름에서는 사용하지 않음
- 패키지에 Upstash 등 외부 rate limiting 라이브러리나 Redis/KV는 없음 — 외부 스토리지 추가는 이번 작업 범위 밖 (PRD 9절 다중 사용자/고도화 Out of Scope와 일관)

## 관련 파일

- `src/components/ui/skeleton.tsx` (신규, shadcn CLI)
- `src/app/loading.tsx` (신규)
- `src/app/expenses/loading.tsx` (신규)
- `src/app/error.tsx` (신규)
- `src/app/expenses/error.tsx` (신규)
- `src/app/page.tsx` (수정 - aria-label 등 접근성 보강)
- `src/app/expenses/expense-filter-table.tsx` (수정 - aria-label, aria-hidden 보강)
- `src/lib/notion/queries.ts` (수정 - `unstable_cache` 60초 캐싱)
- `src/lib/rate-limit.ts` (신규 - in-memory rate limiter)
- `src/app/api/export/route.ts` (수정 - rate limiting 적용, 캐싱 관련 주석)
- `docs/ROADMAP.md` (수정 - Task 008 완료 표시, Task 009/010 일부 항목 표시)

## 수락 기준

- [x] `npx shadcn@latest add skeleton`으로 Skeleton 컴포넌트 설치
- [x] `/`, `/expenses`에 각각 `loading.tsx`가 존재하며 데이터 로딩 중 페이지 레이아웃을 모사한 스켈레톤이 표시됨
- [x] `/`, `/expenses`에 각각 `error.tsx`(`'use client'`)가 존재하며 한국어 에러 메시지와 "다시 시도" 버튼(`onClick={reset}`)이 표시됨
- [x] 주요 인터랙티브 요소(Select, Button)에 `aria-label`이 추가되고, 빈 상태 아이콘에 `aria-hidden="true"`가 추가됨
- [x] `getExpenses()`가 60초(`revalidate: 60`) 캐싱되며, 시그니처(`Promise<Expense[]>`, 인자 없음)는 변경되지 않음
- [x] `/api/export`가 IP 기준 1분당 N회(10회) 초과 요청에 대해 `429 Too Many Requests` JSON 응답을 반환함
- [x] `npm run check-all`, `npm run build` 통과
- [x] Playwright MCP로 `/`, `/expenses`의 모바일(375px)/태블릿(768px)/데스크톱(1280px) 뷰포트 확인, 콘솔 에러 없음
- [x] Playwright MCP 또는 반복 호출로 `/api/export`의 429 응답 확인 및 캐싱 적용 후에도 다운로드 정상 동작 확인
- [x] `docs/ROADMAP.md`에서 Task 008 ✅ 표시, Task 009/010의 해당 세부 항목만 ✅ 표시 (나머지 항목은 미완료 유지)

## 구현 단계

1. `npx shadcn@latest add skeleton` 실행
2. `src/app/loading.tsx`: Header/Footer + `Skeleton`으로 `page.tsx`의 카드 3개 그리드 레이아웃을 모사하는 서버 컴포넌트 작성
3. `src/app/expenses/loading.tsx`: 필터 컨트롤(Select 2개 + 버튼) + 테이블 영역을 모사하는 스켈레톤 작성
4. `src/app/error.tsx`, `src/app/expenses/error.tsx`: `'use client'`, props `{ error: Error; reset: () => void }`, 한국어 에러 메시지 + "다시 시도" 버튼(`onClick={reset}`)
5. `src/app/page.tsx`, `src/app/expenses/expense-filter-table.tsx`: Select/Button에 `aria-label` 추가, `Inbox` 아이콘에 `aria-hidden="true"` 추가
6. `src/lib/notion/queries.ts`: `next/cache`의 `unstable_cache`로 내부 데이터 조회 함수를 래핑하여 60초(`revalidate: 60`) 캐싱 적용. `getDataSourceId()` 호출도 캐시 범위에 포함
7. `src/lib/rate-limit.ts` 신규: IP 기준 고정 윈도우(1분당 10회) in-memory rate limiter (`checkRateLimit(identifier)` 형태) 작성, Vercel 서버리스 환경에서의 한계(best-effort) 주석 명시
8. `src/app/api/export/route.ts`: 요청 헤더 `x-forwarded-for`로 식별자 추출 → `checkRateLimit` 호출 → 초과 시 `429` JSON 응답. `getExpenses()` 60초 캐시를 사용해도 되는 이유 주석 추가 (응답 헤더 `Cache-Control: no-store`는 유지)
9. `npm run check-all && npm run build`
10. Playwright MCP로 `/`, `/expenses` 반응형(375/768/1280px) 확인 + `/api/export` 반복 호출로 429 확인 + 캐싱 후 다운로드 정상 동작 확인
11. `docs/ROADMAP.md` 갱신 (Task 008 ✅, Task 009/010 해당 항목 ✅)

## 테스트 체크리스트

> UI 변경 + API(rate limiting) 변경이 포함되어 있으므로 Playwright MCP로 확인한다.

- [x] `/` 접속 시 콘솔 에러 없음 (모바일/태블릿/데스크톱)
- [x] `/expenses` 접속 시 콘솔 에러 없음 (모바일/태블릿/데스크톱)
- [x] `/`, `/expenses`에서 Select/Button에 `aria-label`이 적용되어 접근성 트리에서 식별 가능
- [x] `/api/export`를 1분 내 11회 이상 호출 시 11번째 이후 요청이 `429`와 JSON 본문(`{ error: ... }`)을 반환
- [x] 캐싱 적용 후에도 `/api/export?year=&month=` 호출 시 200 응답과 정상적인 엑셀 파일이 다운로드됨
- [x] 60초 이내 `getExpenses()` 재호출 시 Notion API가 재호출되지 않음 (캐시 적중)

## 변경 사항 요약

- `npx shadcn@latest add skeleton`으로 `src/components/ui/skeleton.tsx` 추가
- `src/app/loading.tsx` 신규: Header/Footer 포함, 대시보드 카드 3개 그리드를 모사하는 Skeleton 레이아웃
- `src/app/expenses/loading.tsx` 신규: 필터 컨트롤 + 테이블 영역을 모사하는 Skeleton 레이아웃
- `src/app/error.tsx`, `src/app/expenses/error.tsx` 신규: `'use client'` 에러 바운더리, 한국어 메시지 + "다시 시도" 버튼
- `src/app/page.tsx`, `src/app/expenses/expense-filter-table.tsx`: Select/Button `aria-label` 보강, `Inbox` 아이콘 `aria-hidden="true"` 추가
- `src/lib/notion/queries.ts`: `unstable_cache`로 60초 캐싱 적용 (시그니처 동일 유지)
- `src/lib/rate-limit.ts` 신규: in-memory 고정 윈도우 rate limiter (1분당 10회, best-effort)
- `src/app/api/export/route.ts`: rate limiting 적용 (초과 시 429 JSON), 캐싱 관련 주석 추가
- `docs/ROADMAP.md`: Task 008 ✅, Task 009 "Rate limiting 구현" ✅, Task 010 "Notion 데이터 캐싱 전략 적용" ✅ (나머지 세부 항목은 미완료 유지)
- `npm run check-all`, `npm run build` 통과 확인
- Playwright MCP로 반응형 확인 및 `/api/export` 429/캐싱/다운로드 동작 확인
