import type { Record, RecordType } from '@/types'

export interface MonthSummary {
  income: number
  expense: number
  balance: number
}

export interface CategoryBreakdownItem {
  categoryId: string
  amount: number
  percent: number
}

type StatsRecord = Pick<Record, 'type' | 'amount' | 'date' | 'syncStatus' | 'categoryId'>

export function calcMonthSummary(records: StatsRecord[], month: string): MonthSummary {
  const filtered = records.filter(r => r.syncStatus !== 'deleted' && r.date.startsWith(month))
  let income = 0
  let expense = 0
  for (const r of filtered) {
    if (r.type === 'income') income += r.amount
    else expense += r.amount
  }
  return { income, expense, balance: income - expense }
}

export function calcCategoryBreakdown(
  records: StatsRecord[],
  month: string,
  type: RecordType,
): CategoryBreakdownItem[] {
  const filtered = records.filter(
    r => r.syncStatus !== 'deleted' && r.date.startsWith(month) && r.type === type,
  )
  const map = new Map<string, number>()
  for (const r of filtered) {
    map.set(r.categoryId, (map.get(r.categoryId) ?? 0) + r.amount)
  }
  const total = [...map.values()].reduce((sum, amount) => sum + amount, 0)
  return [...map.entries()]
    .map(([categoryId, amount]) => ({
      categoryId,
      amount,
      percent: total === 0 ? 0 : Math.round((amount / total) * 10000) / 100,
    }))
    .sort((a, b) => b.amount - a.amount)
}
