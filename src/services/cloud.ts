import Taro from '@tarojs/taro'

let initialized = false
let initFailed = false

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

/** 懒加载云开发，仅在登录/同步等操作时调用，启动阶段不调用 */
export async function initCloud(): Promise<boolean> {
  if (initialized) return true
  if (initFailed) return false

  try {
    const options: { traceUser: boolean; env?: string } = { traceUser: false }
    if (typeof TARO_APP_CLOUD_ENV === 'string' && TARO_APP_CLOUD_ENV) {
      options.env = TARO_APP_CLOUD_ENV
    }
    Taro.cloud.init(options)
    initialized = true
    return true
  } catch (err) {
    initFailed = true
    console.warn('initCloud failed', err)
    return false
  }
}

export async function callCloudFunction<T>(name: string, data?: Record<string, unknown>): Promise<T> {
  const ready = await initCloud()
  if (!ready) {
    throw new Error('云开发未就绪，请检查是否已开通云开发并配置环境 ID')
  }

  try {
    const { result } = await withTimeout(
      Taro.cloud.callFunction({ name, data }),
      CLOUD_FN_TIMEOUT + 2000,
      `callFunction:${name}`,
    )
    return result as T
  } catch (err) {
    if (isTimeoutError(err)) {
      throw new Error(`云函数 ${name} 超时，请检查云函数是否已部署`)
    }
    throw err
  }
}

export { CLOUD_DB_TIMEOUT }
