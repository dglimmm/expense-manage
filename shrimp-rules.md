# Development Guidelines (AI Agent용)

이 문서는 **Coding Agent**가 "개인 비용 관리 사이트" 프로젝트에서 작업할 때 따라야 할 프로젝트 전용 규칙입니다.
일반적인 Next.js/React/TypeScript 지식은 다루지 않습니다.

## 프로젝트 개요

- Notion 데이터베이스를 CMS로 사용하는 개인 비용 관리 사이트 (백엔드 없음)
- 핵심 명세: `docs/PRD.md` (특히 4절 데이터 모델, 8절 엑셀 템플릿 계약)
- 작업 계획: `docs/ROADMAP.md`

## 작업 워크플로우 (필수)

- 새 기능을 시작하기 전 `docs/ROADMAP.md`에서 해당 Task 항목을 확인한다.
- 작업 단위를 문서화할 때는 `/tasks/XXX-description.md` 형식으로 생성한다 (예: `001-setup.md`).
  - `/tasks` 디렉터리가 아직 없으면 새로 생성해도 된다.
  - API/비즈니스 로직 작업 파일에는 "## 테스트 체크리스트" 섹션을 반드시 포함한다.
- 구현 완료 후 `docs/ROADMAP.md`에서 해당 작업 항목을 ✅로 표시한다 (`/docs:update-roadmap` 스킬 사용 가능).
- 작업 완료 전 반드시 `npm run check-all` (typecheck + lint + format:check)을 통과시킨다.

## 디렉터리 배치 규칙 (이 프로젝트 전용)

ROADMAP/PRD에 따라 아래 위치에 신규 파일을 생성한다. 임의의 다른 위치(`src/utils`, `src/services` 등)를 새로 만들지 않는다.

| 대상                           | 경로                                                                                    |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| 비용/필터 타입 정의            | `src/types/expense.ts`                                                                  |
| Notion API 클라이언트 및 쿼리  | `src/lib/notion/queries.ts` (필요 시 `src/lib/notion/` 하위에 추가 파일)                |
| Notion 응답 → 도메인 모델 매퍼 | `src/lib/notion/` 내부 (queries와 분리 가능)                                            |
| 엑셀 생성 로직                 | `src/lib/excel/` (예: `src/lib/excel/build-workbook.ts`)                                |
| 엑셀 템플릿 파일               | `src/lib/templates/expense-template.xlsx` (이미 존재, 절대 `/public`으로 이동하지 않음) |
| 더미 데이터                    | `src/lib/mock/expenses.ts`                                                              |
| 비용 다운로드 API              | `src/app/api/export/route.ts`                                                           |
| 날짜 필터링 화면               | `src/app/expenses/page.tsx`                                                             |
| 홈 대시보드                    | `src/app/page.tsx` (기존 파일 수정)                                                     |

- 경로 별칭은 `components.json` 정의를 따른다: `@/components`, `@/lib`, `@/hooks`, `@/ui`, `@/utils`.
- 새 shadcn/ui 컴포넌트는 `npx shadcn@latest add <name>`으로 추가하고 직접 작성하지 않는다.

## Notion 데이터 모델 계약 (PRD 4절)

- Notion 데이터베이스 필드: `content`(Text), `category`(Select), `useDate`(Date), `cost`(Number).
- 이 4개 필드명은 코드 전체에서 동일하게 사용한다 (camelCase 유지, 변형 금지).
- 이 필드를 추가/변경/이름변경할 경우 다음을 **모두 동시에** 수정한다:
  1. `docs/PRD.md` 4절 표
  2. `src/types/expense.ts`의 `Expense` 타입
  3. `src/lib/notion/` 내 Notion 응답 매퍼
  4. 엑셀 컬럼 매핑 (`src/lib/excel/` 및 아래 엑셀 셀 매핑 계약, PRD 8.3절)

## 엑셀 셀 매핑 계약 (PRD 8.3절, 코드-문서 동기화 필수)

- 데이터 시작 셀: `A5`
- 컬럼 매핑: `A`→`useDate`, `B`→`category`, `C`→`content`, `D`→`cost`
- 헤더/합계 등 정적 영역은 절대 덮어쓰지 않는다. 데이터 영역(A5 이하)만 기록한다.
- 이 매핑이 실제 템플릿 파일(`src/lib/templates/expense-template.xlsx`)과 다르면, 실제 템플릿을 기준으로 `docs/PRD.md` 8.3절과 엑셀 생성 코드를 함께 갱신한다. 추측으로 좌표를 변경하지 않는다.
- 엑셀 워크북 생성은 반드시 서버(Route Handler, `src/app/api/export/route.ts`)에서 수행한다. 클라이언트 컴포넌트나 클라이언트 번들에 `xlsx-populate` 등 엑셀 라이브러리를 import하지 않는다.
- `xlsx-populate` 도입 후, 템플릿 파일이 Vercel 함수 번들에 포함되도록 `next.config.ts`의 `outputFileTracingIncludes`에 `src/lib/templates/expense-template.xlsx`를 명시적으로 추가한다.

## 환경 변수 규칙

- 모든 환경 변수는 `src/lib/env.ts`의 `envSchema` (zod)에 추가한 뒤 `env` 객체를 통해서만 접근한다. `process.env`를 다른 파일에서 직접 참조하지 않는다.
- Notion 연동 시 `NOTION_API_KEY`, `NOTION_DATABASE_ID`를 `envSchema`에 추가하고, 루트의 `.env.example` 파일(없으면 생성)에 키 이름만 문서화한다 (`.env` 자체는 커밋하지 않음 — `.gitignore`에 포함되어 있어야 함).

## AI 의사결정 기준

- ROADMAP의 Task 순서를 따른다: 우선순위 표시된 Task를 먼저 완료한다.
- 엑셀/Notion 관련 작업에서 PRD와 실제 코드/템플릿 파일이 충돌하면, 실제 템플릿/코드 상태를 우선하고 PRD를 갱신 대상으로 취급한다 (PRD 8.3절은 "확정 필요"로 표시되어 있음).
- 새 페이지/컴포넌트 추가 시, 여러 페이지에서 재사용되는지 여부로 `src/components/` 하위 카테고리(layout/ui/기타) 또는 `src/app/<route>/` 내부 위치를 결정한다.

## 금지 행동

- 로그인/회원가입/인증/다중 사용자 기능을 추가하지 않는다 (PRD 9절 Out of Scope — `signup-form.tsx`, `login-form.tsx` 등 인증 관련 컴포넌트를 새로 만들지 않음).
- 카테고리별 통계/차트 기능을 임의로 추가하지 않는다 (Out of Scope, 별도 지시 없이 구현 금지).
- `src/lib/templates/expense-template.xlsx`를 `/public`으로 이동하거나 클라이언트에서 직접 fetch하지 않는다.
- 엑셀 생성/파싱 로직을 클라이언트 컴포넌트(`'use client'`)에 작성하지 않는다.
- `docs/PRD.md`의 Notion 필드명(`content`, `category`, `useDate`, `cost`)이나 엑셀 셀 매핑을 코드와 불일치한 상태로 방치하지 않는다 — 변경 시 항상 양쪽을 함께 갱신한다.
- `process.env`를 `src/lib/env.ts` 외부에서 직접 사용하지 않는다.
