# Task 009: 보안 및 에러 처리 강화

## 개요

Phase 4 Task 009의 나머지 항목(API키 보안검증, 상세 에러 로깅 시스템, CORS 정책 설정)을 구현한다. "Rate limiting 구현" 항목은 Task 008에서 이미 앞당겨 구현(`src/lib/rate-limit.ts`, `/api/export`의 `checkRateLimit()` 적용)되어 있으므로 이번 작업에서는 다루지 않는다.

- **A. 상세 에러 로깅 시스템**: `src/lib/logger.ts` 신규 작성 후 `getExpenses()` 호출부(`/`, `/expenses`)와 `/api/export`에 적용
- **B. `/api/export` 입력값 검증**: year/month 쿼리 파라미터를 zod로 검증, 실패 시 400 응답
- **C. 엑셀 다운로드 에러 피드백**: `expense-filter-table.tsx`의 다운로드 방식을 직접 링크에서 fetch+blob+toast로 변경
- **D. API 키 보안검증 / CORS 정책**: 기존 `src/lib/env.ts` 검증 및 `.env.example` 점검, CORS는 범위 축소 결정을 문서화

## 현재 상태 분석

- `src/app/page.tsx`, `src/app/expenses/page.tsx`는 `getExpenses()`를 try/catch 없이 호출함. Task 008에서 `app/error.tsx`, `app/expenses/error.tsx`가 이미 생성되어 있어 예외를 던지면 Next.js가 해당 `error.tsx`로 라우팅하지만, 에러 발생 시 서버 로그에 구조화된 정보가 남지 않음
- `src/app/api/export/route.ts`는 `year`/`month` 쿼리 파라미터를 `Number()`로만 변환함. `Number('abc')`는 `NaN`이 되어 `filterExpensesByDate`에서 `year !== filter.year` 비교 시 항상 `false`가 되므로(NaN과의 비교는 항상 false) 실제로는 필터링이 무시된 채 전체 데이터로 엑셀이 생성됨 — 사용자에게 의도와 다른 결과가 조용히 반환되는 문제가 있어 명시적 검증이 필요함
- `src/app/expenses/expense-filter-table.tsx`의 `handleExcelDownload`는 `window.location.href = '/api/export?...'`로 직접 이동함. 이 방식은 응답이 4xx/5xx이거나 JSON 에러 본문이어도 브라우저가 그대로 다운로드를 시도하거나 빈 화면을 보여줄 뿐, 사용자에게 실패 원인을 알려줄 방법이 없음. sonner(`toast`)는 이미 설치되어 있고 `src/app/layout.tsx`에 `<Toaster />`가 배치되어 있음
- `src/lib/env.ts`는 zod `envSchema`로 `NOTION_API_KEY`(`z.string()`), `NOTION_DATABASE_ID`(`z.string()`)를 필수값으로 검증하며, 누락/타입 불일치 시 모듈 로드 시점에 `envSchema.parse()`가 throw하여 빌드/런타임 즉시 실패함. 이는 "키가 없는 상태로 배포되어 조용히 실패"하는 상황을 막아주므로 API 키 보안검증 요건을 이미 충족하고 있다고 판단함. `.env.example`에도 `NOTION_API_KEY`, `NOTION_DATABASE_ID` 키 이름이 값 없이 문서화되어 있어 추가 변경이 필요 없음
- `src/lib/logger.ts`는 존재하지 않음

### CORS 정책에 대한 결정 (범위 축소)

- PRD 9절(다중 사용자 지원 및 인증은 Out of Scope) 및 `shrimp-rules.md`("로그인/회원가입/인증/다중 사용자 기능을 추가하지 않는다")에 근거해, 이 애플리케이션은 **개인용 단일 사용자**가 자신의 배포 도메인에서만 접근하는 것을 전제로 한다
- `/api/export`는 같은 Next.js 앱 내 `expense-filter-table.tsx`에서만 호출되는 **동일 출처(same-origin) API**이며, 외부 도메인에서의 크로스 오리진 호출을 허용할 필요가 없음
- 브라우저의 기본 동일 출처 정책(SOP)이 이미 외부 출처의 임의 호출을 차단하므로, 별도의 `Access-Control-Allow-Origin` 등 CORS 헤더 설정은 **불필요**하며 오히려 불필요한 외부 접근을 허용할 위험이 있음
- 따라서 이번 작업에서는 CORS 관련 코드 변경을 하지 않으며, 이 결정 근거를 본 문서에 기록하는 것으로 ROADMAP의 "CORS 정책 설정" 항목을 충족 처리한다 (향후 다중 사용자/외부 클라이언트 지원이 추가될 경우 재검토 대상)

## 관련 파일

- `src/lib/logger.ts` (신규)
- `src/app/page.tsx` (수정)
- `src/app/expenses/page.tsx` (수정)
- `src/app/api/export/route.ts` (수정)
- `src/app/expenses/expense-filter-table.tsx` (수정)
- `docs/ROADMAP.md` (수정)

## 수락 기준

- [x] `src/lib/logger.ts`에 `logError(scope, error)`가 ISO timestamp + scope + 메시지(+ stack)를 JSON으로 `console.error` 출력함
- [x] `/`, `/expenses`에서 `getExpenses()` 실패 시 `logError`로 로그를 남기고 다시 throw하여 기존 `error.tsx`가 표시됨
- [x] `/api/export`에서 `year`/`month`가 유효 범위를 벗어나면 `400`과 `{ error: ... }` JSON을 반환함
- [x] `/api/export`에서 워크북 생성 중 예외가 발생하면 `logError` 호출 후 `500`과 `{ error: ... }` JSON을 반환함
- [x] `expense-filter-table.tsx`의 엑셀 다운로드가 fetch+blob 방식으로 동작하고, 실패 시 `toast.error`로 에러 메시지가 표시됨
- [x] 기존 rate limiting(`checkRateLimit`) 로직은 그대로 유지됨
- [x] CORS 정책에 대한 범위 축소 결정이 본 문서에 근거와 함께 기록됨
- [x] `src/lib/env.ts`의 기존 zod 검증과 `.env.example`이 최신 상태임을 확인함 (추가 코드 변경 없음)
- [x] `npm run check-all`, `npm run build` 통과

## 구현 단계

1. `src/lib/logger.ts` 신규: `logError(scope: string, error: unknown): void` 작성
2. `src/app/page.tsx`, `src/app/expenses/page.tsx`: `getExpenses()` 호출을 try/catch로 감싸고 catch에서 `logError(...)` 후 `throw e`
3. `src/app/api/export/route.ts`: 기존 rate limiting 로직 아래에 `year`/`month`를 검증하는 zod 스키마(`z.coerce.number().int().min().max().optional()`) 추가, 검증 실패 시 `400` JSON 응답. 워크북 생성 과정을 try/catch로 감싸 실패 시 `logError` 후 `500` JSON 응답
4. `src/app/expenses/expense-filter-table.tsx`: `handleExcelDownload`를 async로 변경 — `fetch('/api/export?...')` → 실패 시 응답 JSON의 `error`로 `toast.error` → 성공 시 `Content-Disposition` 헤더에서 파일명 추출 후 `blob()` → `URL.createObjectURL` → 임시 `<a>` 클릭 다운로드 → `URL.revokeObjectURL`
5. `src/lib/env.ts`, `.env.example` 상태 점검 (변경 불필요 확인)
6. `npm run check-all && npm run build`
7. Playwright MCP로 `/api/export?year=abc` 400 확인, 정상 다운로드 확인, 토스트 에러 확인, `getExpenses()` 임시 에러 주입 후 `error.tsx`/"다시 시도" 동작 확인 → 원복
8. `docs/ROADMAP.md` Task 009의 "API키 보안검증", "상세 에러 로깅 시스템", "CORS 정책 설정" 항목 체크

## 테스트 체크리스트

> API/에러 처리 로직 변경이 포함되어 있으므로 Playwright MCP + curl로 확인한다.

- [x] `curl -i "/api/export?year=abc"` → `400`과 `{ error: ... }` JSON 응답
- [x] `curl -i "/api/export?month=13"` → `400`과 `{ error: ... }` JSON 응답
- [x] `curl -i "/api/export?year=2026&month=6"` → `200`과 정상 엑셀 응답
- [x] `/expenses`에서 "엑셀 다운로드" 클릭 시 정상적으로 `지출결의서_yyyyMMdd.xlsx` 파일이 다운로드됨 (Content-Disposition의 UTF-8 파일명 사용)
- [x] `/api/export` 요청을 400으로 가로채 클릭 시 `toast.error`로 에러 메시지가 노출됨
- [x] `getExpenses()`를 임시로 에러를 던지도록 수정 후 `/` 접속 시 `app/error.tsx`(한국어 메시지 + "다시 시도" 버튼)가 표시되고, `logError`가 JSON 형식으로 서버 로그에 출력됨을 확인. 확인 후 원래 코드로 복원
- [x] `npm run check-all`, `npm run build` 통과

## 변경 사항 요약

- `src/lib/logger.ts` 신규: `logError(scope, error)` — ISO timestamp + scope + message(+ stack)를 JSON으로 `console.error` 출력하는 최소 구조화 로깅 유틸
- `src/app/page.tsx`, `src/app/expenses/page.tsx`: `getExpenses()` 호출을 try/catch로 감싸 실패 시 `logError('home/getExpenses' | 'expenses/getExpenses', e)` 후 재throw하여 Task 008의 `error.tsx`가 처리하도록 함
- `src/app/api/export/route.ts`: 기존 rate limiting 로직 유지. `year`(2000~2100)/`month`(1~12) 쿼리 파라미터를 zod(`z.coerce.number().int().min().max().optional()`)로 검증해 실패 시 `400 { error }` 응답. 워크북 생성 과정을 try/catch로 감싸 예외 발생 시 `logError('api/export', e)` 후 `500 { error }` 응답
- `src/app/expenses/expense-filter-table.tsx`: `handleExcelDownload`를 async로 변경. 기존 `window.location.href` 직접 이동 방식은 에러 응답을 사용자에게 알릴 수 없어, `fetch` → 실패 시 응답 JSON의 `error` 메시지로 `toast.error`, 성공 시 `Content-Disposition`의 `filename*=UTF-8''...`에서 파일명을 추출해 `blob()` → `URL.createObjectURL` → 임시 `<a>` 클릭 다운로드로 변경
- `src/lib/env.ts`, `.env.example`: 기존 zod 검증(`NOTION_API_KEY`, `NOTION_DATABASE_ID` 필수)과 키 이름 문서화가 이미 충실함을 확인, 코드 변경 없음
- CORS 정책: 개인용 단일 사용자 + 동일 출처 API라는 점에 근거해 별도 CORS 헤더 설정이 불필요함을 "현재 상태 분석"에 결정 근거와 함께 문서화 (코드 변경 없음)
- `npm run check-all`, `npm run build` 통과 확인
- curl로 `/api/export`의 400(잘못된 year/month)/200(정상) 응답 확인, Playwright MCP로 정상 다운로드/토스트 에러/`error.tsx` "다시 시도" 동작 확인 후 임시 테스트 코드 원복
- `docs/ROADMAP.md`: Task 009의 "API키 보안검증", "상세 에러 로깅 시스템", "CORS 정책 설정" 항목 체크 (체크되어 있던 "Rate limiting 구현"은 변경하지 않음)
