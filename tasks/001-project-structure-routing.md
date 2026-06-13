# Task 001: 프로젝트 구조 및 라우팅 설정

## 개요

개인 비용 관리 사이트의 애플리케이션 골격을 구축한다. Phase 1의 우선순위 작업으로, 이후 모든 Task(타입 정의, UI 구현, Notion/엑셀 연동)가 이 구조 위에서 진행된다.

## 현재 상태 분석

- 스타터킷의 로그인/회원가입/랜딩 섹션 등 보일러플레이트는 이미 제거되어 있음 (확인 완료)
- 공통 레이아웃 컴포넌트(`Header`, `Footer`, `Container`)는 이미 구현되어 있고 `RootLayout`에 적용됨
- `src/app/layout.tsx`에 메타데이터(title/description)도 이미 설정됨
- 홈(`/`) 페이지는 존재하나 더미 타이틀만 표시 중
- `/expenses` 라우트, `app/api/export/route.ts`는 아직 없음
- 헤더에 `/`와 `/expenses` 간 이동을 위한 네비게이션이 없음

## 관련 파일

- `src/app/page.tsx` (수정)
- `src/app/expenses/page.tsx` (신규)
- `src/app/api/export/route.ts` (신규)
- `src/components/layout/header.tsx` (수정 — 네비게이션 추가)

## 수락 기준

- [x] `/` 접속 시 홈 대시보드 페이지가 정상 렌더링된다
- [x] `/expenses` 접속 시 날짜 필터링 화면 골격 페이지가 정상 렌더링된다
- [x] 헤더에서 `/`와 `/expenses` 간 이동이 가능하다 (Lucide 아이콘 포함 네비게이션)
- [x] `GET /api/export` 요청 시 빈 Route Handler가 501(Not Implemented) JSON 응답을 반환한다 (실제 엑셀 생성은 Task 007에서 구현)
- [x] `npm run check-all` 통과
- [x] `npm run build` 성공

## 구현 단계

1. `src/components/layout/header.tsx`에 Lucide 아이콘과 함께 `/`(홈), `/expenses`(지출 내역) 네비게이션 링크 추가
2. `src/app/expenses/page.tsx` 생성 — "날짜 필터링" 영역의 골격 페이지 (제목 + 빈 상태 placeholder)
3. `src/app/api/export/route.ts` 생성 — 빈 GET 핸들러, 추후 Task 007에서 엑셀 바이너리 응답으로 교체
4. `src/app/page.tsx` 홈 대시보드 타이틀/설명을 PRD에 맞게 다듬기 (연간 지출 대시보드 + 간단한 안내문)
5. `npm run check-all` 및 `npm run build`로 검증

## 테스트 체크리스트

> API/비즈니스 로직 변경이 포함되므로 Playwright MCP로 검증한다.

- [x] `/` 페이지 접속 후 헤더 네비게이션이 보이는지 확인
- [x] 헤더의 "지출 내역" 링크 클릭 시 `/expenses`로 이동하는지 확인
- [x] `/expenses` 페이지가 에러 없이 렌더링되는지 확인
- [x] `/api/export` 엔드포인트에 요청 시 501 응답을 반환하는지 확인 (페이지 내 `fetch`로 확인)

## 변경 사항 요약

- `src/components/layout/header.tsx`: Lucide 아이콘(`LayoutDashboard`, `Receipt`)과 함께 `/`(대시보드), `/expenses`(지출 내역) 네비게이션 추가
- `src/app/expenses/page.tsx` 신규 생성: 지출 내역 페이지 골격 (제목, 안내문, 빈 상태 placeholder)
- `src/app/api/export/route.ts` 신규 생성: 빈 GET 핸들러, `{ status: 'not_implemented' }`와 501 응답 (Task 007에서 실제 엑셀 응답으로 교체)
- `src/app/page.tsx`: 홈 대시보드에 안내문("올해 지출 내역을 한눈에 확인하세요.") 추가
- `src/types/expense.ts` 신규 생성 (Task 002): `Expense`, `ExpenseDateFilter`, `ExcelCellMapping`/`EXPENSE_EXCEL_CELL_MAPPING`, `NotionExpenseProperties`/`NotionExpensePage`, `MapNotionPageToExpense` 정의 — PRD 4절/8.3절 계약을 코드로 반영
- `npm run check-all`, `npm run build` 통과 확인. 부수적으로 프로젝트 전반의 미포맷 파일(`docs/PRD.md`, `docs/guides/*`, `.claude/commands/git/*`, `.claude/settings.local.json`)을 prettier로 정리
- Playwright MCP로 `/` → `/expenses` 네비게이션, `/api/export` 501 응답 확인 완료
