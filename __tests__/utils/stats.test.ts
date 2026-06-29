import { calcMonthSummary, calcCategoryBreakdown, buildTypedCategoryRank } from '@/utils/stats'

describe('calcMonthSummary', () => {
  it('计算月收入支出结余', () => {
    const records = [
      { type: 'income', amount: 100, date: '2026-06-01', syncStatus: 'synced', categoryId: 'a' },
      { type: 'expense', amount: 30, date: '2026-06-15', syncStatus: 'synced', categoryId: 'b' },
    ] as any[]
    const r = calcMonthSummary(records, '2026-06')
    expect(r.income).toBe(100)
    expect(r.expense).toBe(30)
    expect(r.balance).toBe(70)
    expect(r.lastIncome).toBe(0)
    expect(r.lastExpense).toBe(0)
  })

  it('跨年计算上月数据', () => {
    const records = [
      { type: 'income', amount: 100, date: '2026-01-15', syncStatus: 'synced', categoryId: 'a' },
      { type: 'expense', amount: 50, date: '2025-12-01', syncStatus: 'synced', categoryId: 'b' },
    ] as any[]
    const r = calcMonthSummary(records, '2026-01')
    expect(r.lastIncome).toBe(0)
    expect(r.lastExpense).toBe(50)
  })
})

describe('calcCategoryBreakdown', () => {
  const records = [
    { type: 'expense', amount: 30, date: '2026-06-01', syncStatus: 'synced', categoryId: 'food' },
    { type: 'expense', amount: 20, date: '2026-06-02', syncStatus: 'synced', categoryId: 'food' },
    { type: 'income', amount: 100, date: '2026-06-03', syncStatus: 'synced', categoryId: 'salary' },
  ] as any[]

  it('按支出类型聚合', () => {
    const r = calcCategoryBreakdown(records, '2026-06', 'expense')
    expect(r).toHaveLength(1)
    expect(r[0].categoryId).toBe('food')
    expect(r[0].amount).toBe(50)
  })

  it('按收入类型聚合', () => {
    const r = calcCategoryBreakdown(records, '2026-06', 'income')
    expect(r).toHaveLength(1)
    expect(r[0].categoryId).toBe('salary')
    expect(r[0].amount).toBe(100)
  })
})

describe('buildTypedCategoryRank', () => {
  const categories = [
    { _id: 'food', type: 'expense', name: '餐饮' },
    { _id: 'traffic', type: 'expense', name: '交通' },
    { _id: 'salary', type: 'income', name: '工资' },
  ] as any[]

  it('支出排行仅含支出分类', () => {
    const records = [
      { type: 'expense', amount: 30, date: '2026-06-01', syncStatus: 'synced', categoryId: 'food' },
      { type: 'income', amount: 100, date: '2026-06-02', syncStatus: 'synced', categoryId: 'salary' },
    ] as any[]
    const r = buildTypedCategoryRank(records, categories, '2026-06', 'expense')
    expect(r.map(x => x.name)).toEqual(['餐饮'])
    expect(r[0].amount).toBe(30)
  })

  it('收入排行仅含收入分类', () => {
    const records = [
      { type: 'expense', amount: 30, date: '2026-06-01', syncStatus: 'synced', categoryId: 'food' },
      { type: 'income', amount: 100, date: '2026-06-02', syncStatus: 'synced', categoryId: 'salary' },
    ] as any[]
    const r = buildTypedCategoryRank(records, categories, '2026-06', 'income')
    expect(r.map(x => x.name)).toEqual(['工资'])
    expect(r[0].amount).toBe(100)
  })
})
