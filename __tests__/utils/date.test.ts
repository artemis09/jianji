import { groupRecordsByDate, formatDateLabel } from '@/utils/date'
import type { Record } from '@/types'

const base = (date: string): Record => ({
  _id: '1',
  userId: 'u',
  type: 'expense',
  amount: 10,
  categoryId: 'c',
  note: '',
  date,
  createdAt: '',
  updatedAt: '',
  syncStatus: 'synced',
})

describe('groupRecordsByDate', () => {
  it('按日期倒序分组', () => {
    const groups = groupRecordsByDate([base('2026-06-24'), base('2026-06-25')])
    expect(groups[0].date).toBe('2026-06-25')
    expect(groups).toHaveLength(2)
  })
})

describe('formatDateLabel', () => {
  it('今天显示「今日」', () => {
    const today = new Date().toISOString().slice(0, 10)
    expect(formatDateLabel(today)).toBe('今日')
  })
})
