import type { Record } from '@/types'

export function groupRecordsByDate(records: Record[]) {
  const map = new Map<string, Record[]>()
  for (const r of records.filter(x => x.syncStatus !== 'deleted')) {
    if (!map.has(r.date)) map.set(r.date, [])
    map.get(r.date)!.push(r)
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({ date, items }))
}

export function formatDateLabel(date: string): string {
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (date === today) return '今日'
  if (date === yesterday) return '昨日'
  const [, m, d] = date.split('-')
  return `${Number(m)}月${Number(d)}日`
}

export function currentDateStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function parseDateStr(date: string): { year: number; month: number; day: number } {
  const [y, m, d] = date.split('-').map(Number)
  const now = new Date()
  return {
    year: y || now.getFullYear(),
    month: m || now.getMonth() + 1,
    day: d || now.getDate(),
  }
}

export function formatDateParts(year: number, month: number, day: number): string {
  const mm = String(month).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function buildYearRange(start: number, end: number): number[] {
  const years: number[] = []
  for (let y = start; y <= end; y += 1) years.push(y)
  return years
}

export function buildDayRange(year: number, month: number): number[] {
  const total = daysInMonth(year, month)
  const days: number[] = []
  for (let d = 1; d <= total; d += 1) days.push(d)
  return days
}
