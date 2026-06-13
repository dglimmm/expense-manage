import { NextResponse } from 'next/server'

// TODO: Task 007에서 필터 조건을 받아 엑셀 워크북 바이너리를 생성/응답하도록 구현
export async function GET() {
  return NextResponse.json({ status: 'not_implemented' }, { status: 501 })
}
