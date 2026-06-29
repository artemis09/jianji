import type { Record, RecordType } from '@/types'

export interface MonthSummary {
  income: number
  expense: number
  balance: number
  lastIncome: number
  lastExpense: number
}

export interface CategoryBreakdownItem {
  categoryId: string
  amount: number
  percent: number
}

type StatsRecord = Pick<Record, 'type' | 'amount' | 'date' | 'syncStatus' | 'categoryId'>

export function calcMonthSummary(records: StatsRecord[], month: string): MonthSummary {
  const [year, mon] = month.split('-')
  let lastMonth: string
  if (mon === '01') {
    lastMonth = `${Number(year) - 1}-12`
  } else {
    lastMonth = `${year}-${String(Number(mon) - 1).padStart(2, '0')}`
  }

  const filtered = records.filter(r => r.syncStatus !== 'deleted' && r.date.startsWith(month))
  const lastFiltered = records.filter(r => r.syncStatus !== 'deleted' && r.date.startsWith(lastMonth))

  let income = 0, expense = 0, lastIncome = 0, lastExpense = 0
  for (const r of filtered) {
    if (r.type === 'income') income += r.amount
    else expense += r.amount
  }
  for (const r of lastFiltered) {
    if (r.type === 'income') lastIncome += r.amount
    else lastExpense += r.amount
  }

  return { income, expense, balance: income - expense, lastIncome, lastExpense }
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

const UNCLASSIFIED_ID = '__unclassified__'

/** 按收支类型生成分类排行（仅含该类型分类，错绑记录归入「未分类」） */
export function buildTypedCategoryRank(
  records: StatsRecord[],
  categories: Array<{ _id: string; type: RecordType; name: string }>,
  month: string,
  type: RecordType,
): Array<CategoryBreakdownItem & { name: string }> {
  const breakdown = calcCategoryBreakdown(records, month, type)
  const typeCategories = categories.filter(c => c.type === type)
  const typeIds = new Set(typeCategories.map(c => c._id))
  const amountByCat = new Map(breakdown.map(b => [b.categoryId, b.amount]))

  let unclassified = 0
  for (const item of breakdown) {
    if (!typeIds.has(item.categoryId)) {
      unclassified += item.amount
    }
  }

  const rows: Array<{ categoryId: string; amount: number }> = []
  for (const cat of typeCategories) {
    const amount = amountByCat.get(cat._id) ?? 0
    if (amount > 0) rows.push({ categoryId: cat._id, amount })
  }
  if (unclassified > 0) {
    rows.push({ categoryId: UNCLASSIFIED_ID, amount: unclassified })
  }

  const total = rows.reduce((sum, row) => sum + row.amount, 0)
  const nameMap = new Map(typeCategories.map(c => [c._id, c.name]))

  return rows
    .map(row => ({
      categoryId: row.categoryId,
      name: row.categoryId === UNCLASSIFIED_ID
        ? '未分类'
        : (nameMap.get(row.categoryId) || '未分类'),
      amount: row.amount,
      percent: total === 0 ? 0 : Math.round((row.amount / total) * 10000) / 100,
    }))
    .sort((a, b) => b.amount - a.amount)
}
