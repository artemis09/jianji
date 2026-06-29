import { calcMonthSummary } from '@/utils/stats'

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
