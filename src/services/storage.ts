import Taro from '@tarojs/taro'
import { KEYS } from '@/constants/storage-keys'
import type { Record, Category, PendingOp, ThemeId, User } from '@/types'

export const storage = {
  getRecords(): Record[] {
    return Taro.getStorageSync(KEYS.RECORDS) || []
  },
  setRecords(records: Record[]) {
    Taro.setStorageSync(KEYS.RECORDS, records)
  },
  getCategories(): Category[] {
    return Taro.getStorageSync(KEYS.CATEGORIES) || []
  },
  setCategories(categories: Category[]) {
    Taro.setStorageSync(KEYS.CATEGORIES, categories)
  },
  getPendingQueue(): PendingOp[] {
    return Taro.getStorageSync(KEYS.PENDING_QUEUE) || []
  },
  setPendingQueue(queue: PendingOp[]) {
    Taro.setStorageSync(KEYS.PENDING_QUEUE, queue)
  },
  getTheme(): ThemeId {
    return Taro.getStorageSync(KEYS.THEME) || 'warm'
  },
  setTheme(theme: ThemeId) {
    Taro.setStorageSync(KEYS.THEME, theme)
  },
  getUser(): User | null {
    return Taro.getStorageSync(KEYS.USER) || null
  },
  setUser(user: User | null) {
    if (user) Taro.setStorageSync(KEYS.USER, user)
    else Taro.removeStorageSync(KEYS.USER)
  },
  getLastSyncAt(): number | null {
    const value = Taro.getStorageSync(KEYS.LAST_SYNC_AT)
    return typeof value === 'number' ? value : null
  },
  setLastSyncAt(timestamp: number) {
    Taro.setStorageSync(KEYS.LAST_SYNC_AT, timestamp)
  },
}
