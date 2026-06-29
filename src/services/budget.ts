import type { Budget } from '@/types'
import { KEYS } from '@/constants/storage-keys'
import Taro from '@tarojs/taro'

export function getBudget(month: string): Budget | null {
  const all: Budget[] = Taro.getStorageSync(KEYS.BUDGET) || []
  return all.find(b => b.month === month) || null
}

export function setBudget(month: string, amount: number, userId: string): Budget {
  const all: Budget[] = Taro.getStorageSync(KEYS.BUDGET) || []
  const existing = all.findIndex(b => b.month === month)
  const budget: Budget = { _id: month, userId, month, amount }

  if (existing >= 0) {
    all[existing] = budget
  } else {
    all.push(budget)
  }

  Taro.setStorageSync(KEYS.BUDGET, all)
  return budget
}

export function removeBudget(month: string): void {
  const all: Budget[] = Taro.getStorageSync(KEYS.BUDGET) || []
  const filtered = all.filter(b => b.month !== month)
  Taro.setStorageSync(KEYS.BUDGET, filtered)
}
