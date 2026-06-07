# 개인 비용 관리 사이트 (Expense Report)

Notion을 CMS로 활용한 개인 비용 관리 사이트입니다. Notion 데이터베이스에 지출 항목을 작성하면 자동으로 사이트에 반영되어, 별도의 관리자 페이지 없이 콘텐츠를 관리할 수 있습니다.

## 주요 기능

- **Notion 데이터베이스 연동**: Notion DB에서 비용 목록을 가져와 사이트에 표시
- **날짜별 필터링**: 특정 기간(연/월/일 단위)으로 지출 목록을 조회
- **엑셀 다운로드**: 필터링된 목록을 기존 엑셀 양식에 데이터를 채워 넣어 다운로드
- **반응형 디자인**: 모바일/태블릿/데스크톱 환경 대응

자세한 기능 명세는 [`docs/PRD.md`](./docs/PRD.md)를 참고하세요.

## 기술 스택

- **Frontend**: Next.js 15 (App Router + Turbopack), React 19, TypeScript
- **CMS**: Notion API (`@notionhq/client`)
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Icons**: Lucide React
- **엑셀 생성**: `xlsx-populate`
- **Deployment**: Vercel

## 시작하기

개발 서버 실행:

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 결과를 확인할 수 있습니다.

## 자주 사용하는 명령어

```bash
npm run dev         # 개발 서버 실행 (Turbopack)
npm run build       # 프로덕션 빌드
npm run check-all   # 모든 검사 통합 실행 (권장)
```
