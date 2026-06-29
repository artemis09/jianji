import type { User } from '@/types'
import { initDefaultCategories } from './categories'
import { callCloudFunction, initCloud } from './cloud'
import { storage } from './storage'

async function fetchCloudLogin(): Promise<User> {
  const { openid } = await callCloudFunction<{ openid: string }>('login')

  let user = storage.getUser()
  if (!user) {
    user = { openid, theme: storage.getTheme() }
    storage.setUser(user)
  } else if (user.openid !== openid) {
    user = { ...user, openid }
    storage.setUser(user)
  }

  initDefaultCategories(openid)
  return user
}

/** 优先使用本地缓存，避免每次启动都调云函数 */
export async function silentLogin(): Promise<User> {
  const cached = storage.getUser()
  if (cached?.openid) {
    initDefaultCategories(cached.openid)
    return cached
  }
  return fetchCloudLogin()
}

/** 后台刷新 openid，失败时不抛错 */
export async function refreshCloudLogin(): Promise<User | null> {
  try {
    return await fetchCloudLogin()
  } catch (err) {
    console.warn('refreshCloudLogin failed', err)
    return storage.getUser()
  }
}

export async function bindPhone(code: string): Promise<string> {
  const data = await callCloudFunction<{ phone?: string; errMsg?: string }>('decryptPhone', { code })

  if (data.errMsg || !data.phone) {
    throw new Error(data.errMsg || '绑定手机号失败')
  }

  const user = storage.getUser()
  if (user) {
    storage.setUser({ ...user, phone: data.phone })
  }

  return data.phone
}

/** 首次无 openid 时必须走云端 */
export async function ensureCloudLogin(): Promise<User> {
  const cached = storage.getUser()
  if (cached?.openid) {
    return cached
  }
  await initCloud()
  return fetchCloudLogin()
}
