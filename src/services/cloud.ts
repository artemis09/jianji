import Taro from '@tarojs/taro'

let initialized = false

const CLOUD_FN_TIMEOUT = 10000
const CLOUD_DB_TIMEOUT = 8000

export function isCloudNotEnabledError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return msg.includes('-601034') || msg.includes('没有权限，请先开通云开发')
}

export function isCloudFunctionNotFoundError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return msg.includes('-501000') || msg.includes('FUNCTION_NOT_FOUND')
}

export function isCollectionNotExistError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return msg.includes('-502005') || msg.includes('DATABASE_COLLECTION_NOT_EXIST')
}

export function isTimeoutError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return msg.toLowerCase().includes('timeout') || msg.includes('超时')
}

export function getMissingCollectionName(err: unknown): string | null {
  const msg = err instanceof Error ? err.message : String(err)
  const match = msg.match(/not exist: (\w+)/i)
  return match?.[1] ?? null
}

export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label = 'operation',
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timeout`)), ms)
  })

  try {
    return await Promise.race([promise, timeout])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

export async function initCloud(): Promise<void> {
  if (initialized) return
  await Taro.cloud.init({ traceUser: true })
  initialized = true
}

export async function callCloudFunction<T>(name: string, data?: Record<string, unknown>): Promise<T> {
  await initCloud()
  const { result } = await withTimeout(
    Taro.cloud.callFunction({ name, data }),
    CLOUD_FN_TIMEOUT + 2000,
    `callFunction:${name}`,
  )
  return result as T
}

export { CLOUD_DB_TIMEOUT }
