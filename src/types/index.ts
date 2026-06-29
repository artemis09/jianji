export type ThemeId = 'warm' | 'mint' | 'dark' | 'candy' | 'caramel'
export type RecordType = 'expense' | 'income'
export type SyncStatus = 'synced' | 'pending' | 'deleted'

export interface User {
  _id?: string
  openid: string
  phone?: string
  theme: ThemeId
  avatarUrl?: string
  nickName?: string
  createdAt?: string
}

export interface Category {
  _id: string
  userId: string
  name: string
  icon: string
  type: RecordType
  sort: number
  isDefault: boolean
}

export interface Record {
  _id: string
  userId: string
  type: RecordType
  amount: number
  categoryId: string
  note: string
  date: string
  createdAt: string
  updatedAt: string
  syncStatus: SyncStatus
}

export interface PendingOp {
  id: string
  collection: 'records' | 'categories'
  action: 'create' | 'update' | 'delete'
  payload: Record | Category
  createdAt: string
}

export interface ThemeTokens {
  pageBg: string
  surface: string
  surfaceBorder: string
  textPrimary: string
  textSecondary: string
  primary: string
  primaryGradient: string
  btnGradient: string
  expense: string
  income: string
  glow?: string
}

export interface Budget {
  _id: string
  userId: string
  month: string       // "2026-06"
  amount: number      // 预算总额
}
