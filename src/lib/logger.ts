/**
 * 구조화된 에러 로깅 유틸리티.
 *
 * 외부 모니터링 서비스(Sentry 등) 연동 전 단계의 최소 구현으로,
 * ISO timestamp + scope + 에러 메시지(+ stack)를 JSON 형태로 `console.error`에 출력한다.
 */
export function logError(scope: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined

  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      scope,
      message,
      ...(stack ? { stack } : {}),
    })
  )
}
