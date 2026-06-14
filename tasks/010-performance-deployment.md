# Task 010: 성능 최적화 및 배포

## 개요

Phase 4 Task 010의 나머지 3개 항목(서버 컴포넌트/번들 최적화, Vercel 배포 및 환경 변수/템플릿 파일 번들 포함 검증, 모니터링 및 에러 로깅 구성)을 검증하고 문서화한다. "Notion 데이터 캐싱 전략 적용" 항목은 Task 008에서 이미 구현 완료(`src/lib/notion/queries.ts`의 `getExpenses()`에 `unstable_cache` 60초 캐싱)되어 있으므로 이번 작업에서는 다루지 않는다.

- **A. 서버 컴포넌트/번들 최적화**: `xlsx-populate`가 클라이언트 번들에 포함되지 않는지 빌드 결과로 검증
- **B. Vercel 배포 검증 체크리스트**: `outputFileTracingIncludes`가 실제 빌드 트레이스 파일에 템플릿을 포함시키는지, `.env.example`이 최신 상태인지 정적 검증
- **C. 모니터링 및 에러 로깅 구성**: `src/lib/logger.ts`의 `logError`가 Vercel 기본 로그 수집과 호환됨을 확인하고, 모든 필요한 호출 지점에 적용되어 있는지 점검

본 작업은 코드 변경이 아닌 **검증 및 문서화 중심**이며, 새로운 로깅 인프라/외부 모니터링 서비스(Sentry 등) 도입은 범위 밖이다 (PRD 9절 Out of Scope와 일관).

## 현재 상태 분석

- `src/lib/excel/build-workbook.ts`(`xlsx-populate` 사용)는 `src/app/api/export/route.ts`(서버 Route Handler)에서만 import되며, 클라이언트 컴포넌트에서 import하는 곳은 없음 (`grep` 결과 확인)
- `next.config.ts`에 `outputFileTracingIncludes: { '/api/export': ['./src/lib/templates/expense-template.xlsx'] }`가 Task 007에서 이미 설정되어 있음
- `.env.example`에 `NOTION_API_KEY`, `NOTION_DATABASE_ID`가 값 없이 문서화되어 있음 (Task 005에서 작성, Task 009에서도 재확인됨)
- `src/lib/logger.ts`의 `logError(scope, error)`가 Task 009에서 구현되어 `src/app/page.tsx`, `src/app/expenses/page.tsx`(`getExpenses()` 호출부)와 `src/app/api/export/route.ts`에서 이미 사용 중
- Vercel은 서버리스 함수의 `console.error`/`console.log` 출력을 자동으로 수집해 대시보드의 Logs(Runtime Logs)/Observability에서 조회할 수 있게 해주므로, 별도 로깅 인프라 없이도 `logError`의 JSON 출력이 그대로 모니터링에 활용 가능

## 관련 파일

- `next.config.ts` (검증만, 변경 없음)
- `.env.example` (검증만, 변경 없음)
- `src/lib/logger.ts` (검증만, 변경 없음)
- `src/app/page.tsx`, `src/app/expenses/page.tsx`, `src/app/api/export/route.ts` (검증만, 변경 없음)
- `docs/ROADMAP.md` (수정 - Task 010 나머지 항목 체크 및 헤더 ✅ 표시)
- `tasks/010-performance-deployment.md` (신규, 본 문서)

## 수락 기준

- [x] `npm run build` 후 `.next/static/chunks/*.js`(클라이언트 청크) 전체에서 `xlsx-populate`/`XlsxPopulate` 문자열이 발견되지 않음
- [x] `.next/server/app/api/export/route.js.nft.json`에 `src/lib/templates/expense-template.xlsx` 경로가 포함되어 있음
- [x] `.env.example`에 `NOTION_API_KEY`, `NOTION_DATABASE_ID`가 문서화되어 있음
- [x] `src/lib/logger.ts`의 `logError`가 `getExpenses()` 호출부(`/`, `/expenses`)와 `/api/export`에서 모두 사용되고 있음을 확인
- [x] Vercel 기본 로그 수집(Functions/Runtime Logs)과 `logError`의 호환성이 문서화됨
- [x] `npm run check-all && npm run build` 통과
- [x] `docs/ROADMAP.md`에서 Task 010의 나머지 3개 항목 체크 및 헤더 ✅ 완료 표시

## 구현 단계

1. `npm run build` 실행 (Turbopack 프로덕션 빌드)
2. `grep -rl "xlsx-populate\|XlsxPopulate" .next/static/chunks/`로 클라이언트 청크에 엑셀 라이브러리 포함 여부 확인 → 0건 확인
3. `.next/server/app/api/export/route.js.nft.json`을 파싱해 `expense-template.xlsx` 경로 포함 여부 확인
4. `.env.example` 파일 내용 확인 (`NOTION_API_KEY`, `NOTION_DATABASE_ID` 존재 여부)
5. `grep -rn "logError"` 결과로 `getExpenses()` 호출부와 `/api/export`에서의 사용 현황 확인
6. Vercel 모니터링(Logs/Observability) 활용 방안을 본 문서에 기록
7. `npm run check-all && npm run build` 재확인
8. `docs/ROADMAP.md`의 Task 010 나머지 항목 체크 및 헤더 ✅ 표시

## 테스트 체크리스트

> 코드 변경이 없는 정적 검증 작업이므로 Playwright MCP E2E 테스트는 수행하지 않는다. 빌드 결과물 검증으로 대체한다.

- [x] `npm run build` 성공
- [x] `grep -rl "xlsx-populate\|XlsxPopulate" .next/static/chunks/` → 결과 0건
- [x] `.next/server/app/api/export/route.js.nft.json`에서 `expense-template.xlsx` 경로 검출
- [x] `npm run check-all` 통과 (typecheck/lint/format)

## 변경 사항 요약

### 1. 서버 컴포넌트/번들 최적화 검증 결과

- `npm run build` 실행 후 `.next/static/chunks/` 전체(클라이언트 청크)에서 `xlsx-populate`/`XlsxPopulate` 문자열을 대소문자 구분 없이 검색한 결과 **0건** — 클라이언트 번들에 엑셀 라이브러리가 포함되지 않음을 확인
  - `.next/static/chunks/820e1f54853b8148.js`에서 `xlsx` 문자열이 1건 발견되었으나, 이는 `expense-filter-table.tsx`의 다운로드 파일명 fallback 값(`"expense-report.xlsx"`)이라는 문자열 리터럴이며 `xlsx-populate` 라이브러리 코드가 아님
  - 빌드 결과 트리에서 `/api/export`는 `ƒ (Dynamic)`로 별도 서버 함수 청크(`.next/server/app/api/export/route.js` 및 `.next/server/chunks/[root-of-the-server]__63c29def._.js`)에 `xlsx-populate`가 포함되어 서버 전용으로 격리됨
  - 결론: 코드 변경 불필요. `src/lib/excel/build-workbook.ts`를 Route Handler에서만 import하는 현재 구조가 번들 분리를 올바르게 보장함

### 2. Vercel 배포 체크리스트

| 점검 항목                                      | 결과                                                                                                                                                                                                    |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `outputFileTracingIncludes`에 템플릿 파일 명시 | `next.config.ts`에 `'/api/export': ['./src/lib/templates/expense-template.xlsx']` 설정 확인 (Task 007에서 이미 적용)                                                                                    |
| 빌드 트레이스에 템플릿 파일 실제 포함 여부     | `.next/server/app/api/export/route.js.nft.json`의 `files` 배열에 `../../../../../src/lib/templates/expense-template.xlsx` 경로 포함 확인 — Vercel 함수 번들에 템플릿이 포함되어 런타임에서 읽을 수 있음 |
| 환경 변수 문서화                               | `.env.example`에 `NOTION_API_KEY=`, `NOTION_DATABASE_ID=` 키 이름이 값 없이 문서화되어 있음 (Vercel 프로젝트 설정에서 동일한 키로 값 등록 필요)                                                         |
| 환경 변수 검증                                 | `src/lib/env.ts`의 `envSchema`(zod)가 두 변수를 필수로 검증하여, 누락 시 빌드/런타임 즉시 실패 (Task 009에서 재확인 완료)                                                                               |

> 실제 Vercel 배포(프로덕션 배포 트리거)는 본 작업 범위에 포함하지 않으며, 로컬에서 확인 가능한 빌드 출력/트레이스 파일 기반 정적 검증만 수행함.

### 3. 모니터링 및 에러 로깅 구성

- `src/lib/logger.ts`의 `logError(scope, error)`는 ISO timestamp + scope + 메시지(+ stack)를 JSON 형태로 `console.error`에 출력함 (Task 009에서 구현)
- 사용 현황 (`grep -rn "logError"` 결과):
  - `src/app/page.tsx`: `getExpenses()` 실패 시 `logError('home/getExpenses', e)`
  - `src/app/expenses/page.tsx`: `getExpenses()` 실패 시 `logError('expenses/getExpenses', e)`
  - `src/app/api/export/route.ts`: 워크북 생성 실패 시 `logError('api/export', e)`
  - → ROADMAP/PRD에서 요구하는 핵심 데이터 조회·다운로드 경로 모두에 적용되어 있음을 확인. 추가 적용이 필요한 호출부 없음
- **모니터링 방식**: Vercel은 서버리스 함수(Route Handler, 서버 컴포넌트)의 `console.error`/`console.log` 출력을 자동 수집하여 프로젝트 대시보드의 **Logs(Runtime Logs)** 및 **Observability** 탭에서 실시간/과거 로그를 조회할 수 있게 제공함
  - `logError`가 출력하는 JSON 문자열은 Vercel Logs에서 그대로 검색/필터링 가능 (예: `scope` 필드로 `api/export` 에러만 필터링)
  - 별도의 외부 모니터링 서비스(Sentry 등) 연동 없이도 Vercel 기본 제공 기능으로 에러 발생 시점/빈도/원인 파악이 가능하므로, 개인용 단일 사용자 규모에서는 현재 구성으로 충분함 (외부 서비스 도입은 PRD 9절 Out of Scope 범위와 일관되게 본 작업에서 제외)

### 검증 결과

- `npm run check-all` 통과 (typecheck / lint / format:check)
- `npm run build` 통과 (Turbopack 프로덕션 빌드, 7개 페이지 정적 생성 성공)
- `docs/ROADMAP.md`: Task 010의 "서버 컴포넌트/번들 최적화", "Vercel 배포 및 환경 변수/템플릿 파일 번들 포함 검증", "모니터링 및 에러 로깅 구성" 항목 체크, Task 010 헤더 ✅ 완료로 표시 ("Notion 데이터 캐싱 전략 적용" 항목은 변경하지 않음)
