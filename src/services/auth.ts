import type { User } from '@/types'
import { initDefaultCategories } from './categories'
import { callCloudFunction, initCloud } from './cloud'
import { getPendingSyncCount, pullFromCloud, scheduleSync } from './sync'
import { notifyDataChanged } from './data-events'
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

  // 从云端拉取已有数据，按 _id 合并，避免新设备产生重复
  const pullResult = await pullFromCloud()
  if (pullResult.pulledRecords > 0 || pullResult.pulledCategories > 0) {
    notifyDataChanged()
  }

  // 版本升级时替换为最新预设分类
  initDefaultCategories(openid)
  if (getPendingSyncCount() > 0) {
    scheduleSync(500)
  }
  return user
}

/** 优先使用本地缓存，避免每次启动都调云函数 */
export async function silentLogin(): Promise<User> {
  const cached = storage.getUser()
  if (cached?.openid) {
    const pullResult = await pullFromCloud()
    initDefaultCategories(cached.openid)
    if (pullResult.pulledRecords > 0 || pullResult.pulledCategories > 0) {
      notifyDataChanged()
    }
    if (getPendingSyncCount() > 0) {
      scheduleSync(500)
    }
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
  const ready = await initCloud()
  if (!ready) {
    throw new Error('云开发未就绪，请检查是否已开通云开发并配置环境 ID')
  }
  return fetchCloudLogin()
}
