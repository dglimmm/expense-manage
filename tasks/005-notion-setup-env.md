# Task 005: Notion 연동 준비 및 환경 설정

## 개요

Phase 3(핵심 기능 구현)의 첫 단계로, Notion API 연동에 필요한 패키지를 설치하고 환경 변수 설정을 정리한다. `src/lib/env.ts`의 `envSchema`에는 `NOTION_API_KEY`/`NOTION_DATABASE_ID`가 정의되어 있으나 `envSchema.parse()` 호출 인자에 빠져있던 버그를 수정하고, `.env.example`을 신규 작성해 필요한 환경 변수를 문서화한다.

## 현재 상태 분석

- `package.json`에 `@notionhq/client`가 아직 설치되어 있지 않음
- `src/lib/env.ts`의 `envSchema`에는 `NOTION_API_KEY: z.string()`, `NOTION_DATABASE_ID: z.string()`이 정의되어 있으나, `envSchema.parse({...})` 호출 인자에는 `NODE_ENV`/`VERCEL_URL`/`NEXT_PUBLIC_APP_URL`만 전달되어 두 키가 항상 `undefined`로 검증되는 버그가 있음
- `.env.local`에 `NOTION_API_KEY`, `NOTION_DATABASE_ID`가 이미 실제 값으로 설정되어 있음(사용자가 사전에 구성)
- `.env.example` 파일이 존재하지 않음
- Notion 데이터베이스 내보내기(CSV) 확인 결과 필드명(`content`, `category`, `cost`, `useDate`)이 `docs/PRD.md` 4절 및 `src/types/expense.ts`의 `Expense`/`NotionExpenseProperties`와 일치함

## 관련 파일

- `src/lib/env.ts` (수정)
- `.env.example` (신규)
- `package.json` (수정, `@notionhq/client` 의존성 추가)

## 수락 기준

- [x] `@notionhq/client` 패키지가 설치됨
- [x] `src/lib/env.ts`의 `envSchema.parse()` 호출에 `NOTION_API_KEY`, `NOTION_DATABASE_ID`가 포함되어 `.env.local`의 값이 정상적으로 검증됨
- [x] 루트에 `.env.example`이 생성되고 `NOTION_API_KEY=`, `NOTION_DATABASE_ID=` 키 이름만 placeholder로 문서화됨 (실제 값 미포함)
- [x] `.env.local`은 수정되지 않음
- [x] `npm run check-all` 통과
- [x] `npm run dev` 정상 기동 및 `/` 요청 시 zod 파싱 에러 없음

## 구현 단계

1. `npm install @notionhq/client` 실행
2. `src/lib/env.ts`의 `envSchema.parse({...})` 호출 인자에 `NOTION_API_KEY: process.env.NOTION_API_KEY`, `NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID` 추가
3. 루트에 `.env.example` 신규 생성 (`NOTION_API_KEY=`, `NOTION_DATABASE_ID=`)
4. `npm run check-all`로 typecheck/lint/format 통과 확인
5. `npm run dev` 실행 후 `/` 요청으로 env.ts 모듈이 정상 파싱되는지 확인

## 변경 사항 요약

- `package.json`: `@notionhq/client` 의존성 추가
- `src/lib/env.ts`: `envSchema.parse()` 호출 인자에 `NOTION_API_KEY`, `NOTION_DATABASE_ID`를 추가하여 schema 정의와 실제 검증 대상이 일치하도록 수정
- `.env.example` 신규 생성: `NOTION_API_KEY=`, `NOTION_DATABASE_ID=` placeholder만 포함 (`.env.local`의 실제 값은 노출하지 않음, `.env.local`은 변경 없음)
- `npm run check-all` 통과 확인 (`shrimp_data/tasks.json`의 기존 포맷 경고는 `npx prettier --write`로 정리 후 재통과)
- `npm run dev` 기동 후 `/` 요청이 200으로 응답하며 zod 파싱 에러 없음을 확인
