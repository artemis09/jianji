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
  })
})
