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
