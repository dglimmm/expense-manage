# Task 007: 엑셀 다운로드 기능 구현

## 개요

Task 006에서 연동한 Notion 비용 데이터를 기존에 사용하던 지출결의서 엑셀 양식(`src/lib/templates/expense-template.xlsx`)에 채워 다운로드하는 기능을 구현한다. 엑셀 생성은 `xlsx-populate`를 사용해 서버(Route Handler)에서만 수행하고, `/expenses`의 엑셀 다운로드 버튼을 `/api/export` 호출로 연결한다.

## 현재 상태 분석

- `src/types/expense.ts`의 `EXPENSE_EXCEL_CELL_MAPPING`은 PRD 8.3절의 예시값(`A5`, A~D)을 그대로 사용 중이었으나, 실제 템플릿(`src/lib/templates/expense-template.xlsx`)을 `xlsx-populate`로 직접 열어 확인한 결과 데이터 영역은 `A10`부터 시작하고 C:D가 "상세 내역"으로 병합되어 있으며 "금액"은 E열, 26행에 `E26 = SUM(E10:E25)` 합계 수식이 존재함
- `xlsx-populate`(v1.21.0)는 자체 TypeScript 타입 정의를 제공하지 않음
- `src/app/api/export/route.ts`는 `501 not_implemented`만 반환하는 더미 상태였음
- `expense-filter-table.tsx`의 엑셀 다운로드 버튼은 토스트만 표시하는 TODO 상태였음

## 관련 파일

- `src/lib/excel/build-workbook.ts` (신규)
- `src/types/xlsx-populate.d.ts` (신규)
- `src/types/expense.ts` (수정)
- `src/app/api/export/route.ts` (수정)
- `next.config.ts` (수정)
- `src/app/expenses/expense-filter-table.tsx` (수정)
- `docs/PRD.md` (수정)
- `shrimp-rules.md` (수정)

## 수락 기준

- [x] `EXPENSE_EXCEL_CELL_MAPPING`이 실제 템플릿 레이아웃(A10 시작, A/B/C/E열)과 일치함
- [x] `/api/export`가 200 응답과 함께 `Content-Disposition: attachment; filename="expenses.xlsx"`, `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`를 반환함
- [x] 생성된 엑셀의 9행 헤더와 26행 합계 수식(`E26=SUM(E10:E25)`) 등 정적 영역이 보존되고, A10~부터 실제 데이터가 채워짐
- [x] `/expenses`의 엑셀 다운로드 버튼 클릭 시 실제 파일이 다운로드됨
- [x] `npm run check-all`, `npm run build` 통과

## 구현 단계

1. `xlsx-populate` 설치
2. 실제 템플릿 파일을 `xlsx-populate`로 직접 열어 셀 레이아웃/병합/수식 확인 → `EXPENSE_EXCEL_CELL_MAPPING`을 `A10`, `{ useDate: 'A', category: 'B', content: 'C', cost: 'E' }`로 수정
3. `src/types/xlsx-populate.d.ts` 신규: 사용하는 API(`fromFileAsync`, `sheet`, `cell`, `value`, `outputAsync`)만 최소 선언
4. `src/lib/excel/build-workbook.ts` 신규: 템플릿 로드 후 `EXPENSE_EXCEL_CELL_MAPPING` 기준으로 데이터 영역만 채워 워크북 버퍼 생성. `useDate("yyyy-mm-dd")`는 로컬 타임존 자정 `Date`로 변환해 기록(시간 오프셋으로 인한 날짜 어긋남 방지)
5. `src/app/api/export/route.ts`: `year`/`month` 쿼리 파라미터로 `getExpenses()` 결과를 `filterExpensesByDate`로 필터링 후 `buildExpenseWorkbook`으로 워크북 생성, 바이너리 응답(`Content-Disposition`, `Content-Type` 헤더 포함)
6. `next.config.ts`: 최상위 `outputFileTracingIncludes`(experimental 아님)에 `/api/export` 경로의 템플릿 파일 포함 설정 추가
7. `expense-filter-table.tsx`: `handleExcelDownload`를 async로 변경, `/api/export?year=&month=` fetch → blob → `<a>` 다운로드, 실패 시 토스트
8. `docs/PRD.md` 8.3절, `shrimp-rules.md` 디렉터리 배치 규칙 표를 실제 셀 매핑/경로로 갱신
9. `npm run check-all`, `npm run build`
10. Playwright MCP로 `/expenses`에서 다운로드 버튼 클릭 → `/api/export` 200 응답 및 헤더 확인, 다운로드된 엑셀 파일을 직접 열어 데이터 영역/정적 영역 검증

## 테스트 체크리스트

> API/엑셀 생성 로직 변경이므로 Playwright MCP + 생성된 파일 직접 검증으로 확인한다.

- [x] `/expenses` 접속 시 콘솔 에러 없음
- [x] 엑셀 다운로드 버튼 클릭 시 `/api/export` 요청이 200 응답
- [x] 응답 헤더: `Content-Disposition: attachment; filename="expenses.xlsx"`, `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- [x] 다운로드된 파일의 9행 헤더("날짜/사용 항목/상세 내역/금액/비고")가 그대로 보존됨
- [x] A10, A11에 실제 데이터(2026-06-12/야근식대/베지밀 고단백/16,000, 2026-05-06/교육훈련비/김영한의 실전자바 -중급 2편/77,000)가 채워짐
- [x] E26의 `SUM(E10:E25)` 합계 수식이 그대로 유지됨
- [x] F7(신청일)이 오늘 날짜("yyyy m. d" 형식)로 채워짐

## 변경 사항 요약

- `src/types/expense.ts`: `EXPENSE_EXCEL_CELL_MAPPING`을 실제 템플릿 기준(`A10`, A/B/C/E열)으로 수정하고 주석에 C:D 병합 및 합계 수식 위치를 명시
- `src/types/xlsx-populate.d.ts` 신규: `xlsx-populate`에 타입 정의가 없어 사용하는 API만 최소 선언
- `src/lib/excel/build-workbook.ts` 신규: `buildExpenseWorkbook(expenses)`가 템플릿을 로드해 F7(신청일)에 오늘 날짜(`formatApplicationDate`, "yyyy m. d" 형식)를 채우고 `EXPENSE_EXCEL_CELL_MAPPING` 기준 데이터 영역(A10~)만 채운 워크북 버퍼를 반환. `useDate`는 `parseUseDateAsLocalDate`로 로컬 타임존 자정 `Date`로 변환해 엑셀 직렬값에 시간 오프셋이 생기지 않도록 처리
- `src/app/api/export/route.ts`: `year`/`month` 쿼리로 `getExpenses()` + `filterExpensesByDate` 결과를 필터링 후 `buildExpenseWorkbook`으로 생성한 버퍼를 `Content-Disposition`/`Content-Type` 헤더와 함께 응답
- `next.config.ts`: 최상위(experimental 아님) `outputFileTracingIncludes`에 `/api/export` → `expense-template.xlsx` 매핑 추가
- `src/app/expenses/expense-filter-table.tsx`: `handleExcelDownload`를 async로 변경해 `/api/export?year=&month=` 호출 → blob → `<a>` 다운로드, 실패 시 토스트로 안내
- `docs/PRD.md` 8.3절, `shrimp-rules.md` 디렉터리 배치 규칙 표를 실제 셀 매핑(`A10`, A/B/C/E)과 `src/lib/excel/build-workbook.ts` 경로로 갱신
- `npm run check-all`, `npm run build` 통과 확인
- Playwright MCP로 `/expenses`에서 다운로드 버튼 클릭 시 `/api/export` 200 응답과 올바른 헤더를 확인했고, 다운로드된 엑셀 파일을 직접 열어 헤더/데이터/합계 수식이 정상 보존됨을 확인
