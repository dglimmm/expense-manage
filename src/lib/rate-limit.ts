/**
 * In-memory 기반 best-effort rate limiter.
 *
 * 외부 Redis/KV 없이 서버리스 인스턴스 메모리에 요청 횟수를 기록하는
 * 고정 윈도우(fixed window) 방식의 간단한 rate limiter다.
 *
 * 주의: Vercel 서버리스 환경에서는 함수 인스턴스가 요청마다 재사용되지
 * 않을 수 있어 완전한 보장은 아니다. 개인용 단일 사용자 앱(PRD 9절
 * 다중 사용자 지원 Out of Scope)에 대한 best-effort 보호 목적이며,
 * 다중 사용자/고가용성 환경에서는 외부 스토리지 기반 rate limiter
 * (예: Upstash Redis)로 교체해야 한다.
 */

/** 윈도우 길이 (밀리초 단위, 1분) */
const WINDOW_MS = 60 * 1000

/** 윈도우당 허용 요청 수 */
const MAX_REQUESTS_PER_WINDOW = 10

interface RateLimitEntry {
  count: number
  windowStart: number
}

/** 식별자(IP 등)별 요청 횟수를 기록하는 인메모리 저장소 */
const rateLimitStore = new Map<string, RateLimitEntry>()

export interface RateLimitResult {
  /** 이번 요청이 허용되는지 여부 */
  allowed: boolean
  /** 현재 윈도우에서 남은 요청 가능 횟수 */
  remaining: number
  /** 현재 윈도우가 초기화되는 시각 (epoch ms) */
  resetAt: number
}

/**
 * 주어진 식별자(예: 클라이언트 IP)에 대해 고정 윈도우 방식으로
 * 요청 횟수를 검사하고 카운트를 증가시킨다.
 */
export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    // 새 윈도우 시작
    rateLimitStore.set(identifier, { count: 1, windowStart: now })
    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_WINDOW - 1,
      resetAt: now + WINDOW_MS,
    }
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.windowStart + WINDOW_MS,
    }
  }

  entry.count += 1
  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - entry.count,
    resetAt: entry.windowStart + WINDOW_MS,
  }
}
