import { View, Text } from '@tarojs/components'
import { useMemo, useState, useCallback } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { useDataRefresh } from '@/hooks/useDataRefresh'
import ThemedSelectorPicker from '@/components/ThemedPicker/ThemedSelectorPicker'
import TabPageShell from '@/components/TabPageShell'
import { getRecords } from '@/services/records'
import { triggerSync } from '@/services/sync'
import { calcMonthSummary } from '@/utils/stats'
import { formatAmount } from '@/utils/amount'
import type { Record } from '@/types'
import './index.scss'

function formatTableAmount(n: number): string {
  if (n === 0) return '0'
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

function collectYears(records: Record[]): string[] {
  const set = new Set<string>()
  set.add(String(new Date().getFullYear()))
  for (const r of records) {
    if (r.syncStatus !== 'deleted') set.add(r.date.slice(0, 4))
  }
  return [...set].sort((a, b) => Number(b) - Number(a))
}

function calcYearSummary(records: Record[], year: string) {
  let income = 0
  let expense = 0
  const prefix = `${year}-`
  for (const r of records) {
    if (r.syncStatus !== 'deleted' && r.date.startsWith(prefix)) {
      if (r.type === 'income') income += r.amount
      else expense += r.amount
    }
  }
  return { income, expense, balance: income - expense }
}

export default function BillPage() {
  const pageClass = 'page-bill'
  const [records, setRecords] = useState(() => getRecords())
  const [year, setYear] = useState(() => String(new Date().getFullYear()))

  const refresh = useCallback(() => {
    setRecords(getRecords())
  }, [])

  useDataRefresh(refresh)

  useDidShow(() => {
    refresh()
    void triggerSync()
  })

  const years = useMemo(() => collectYears(records), [records])
  const yearSummary = useMemo(() => calcYearSummary(records, year), [records, year])

  const monthRows = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const maxMonth = Number(year) === currentYear ? currentMonth : 12

    return Array.from({ length: maxMonth }, (_, i) => {
      const mon = maxMonth - i
      const monthKey = `${year}-${String(mon).padStart(2, '0')}`
      const summary = calcMonthSummary(records, monthKey)
      return { monthKey, label: `${String(mon).padStart(2, '0')}月`, ...summary }
    })
  }, [records, year])

  const handleMonth = (monthKey: string) => {
    Taro.eventCenter.trigger('setIndexMonth', monthKey)
    Taro.switchTab({ url: '/pages/index/index' })
  }

  return (
    <TabPageShell activeTab='bill' pageClass={pageClass}>
      <View className='page-bill__header'>
        <ThemedSelectorPicker
          title='选择年份'
          options={years}
          value={year}
          onChange={setYear}
          formatOption={y => `${y}年`}
        >
          <View className='page-bill__year-picker pressable'>
            <Text>{year}年</Text>
            <Text className='page-bill__year-arrow'>▼</Text>
          </View>
        </ThemedSelectorPicker>
        <Text className='page-bill__brand'>简记</Text>
        <View className='page-bill__header-spacer' />
      </View>

      <View className='page-bill__year-card'>
        <Text className='page-bill__watermark'>¥</Text>
        <Text className='page-bill__balance-label'>结余</Text>
        <Text className='page-bill__balance'>{formatAmount(yearSummary.balance)}</Text>
        <View className='page-bill__year-row'>
          <Text className='page-bill__year-stat'>收入 {formatAmount(yearSummary.income)}</Text>
          <Text className='page-bill__year-stat'>支出 {formatAmount(yearSummary.expense)}</Text>
        </View>
      </View>

      <View className='page-bill__table'>
        <View className='page-bill__table-head'>
          <Text className='page-bill__col page-bill__col--month'>月份</Text>
          <Text className='page-bill__col'>月收入</Text>
          <Text className='page-bill__col'>月支出</Text>
          <Text className='page-bill__col'>月结余</Text>
        </View>

        {monthRows.map(row => (
          <View
            key={row.monthKey}
            className='page-bill__table-row pressable'
            onClick={() => handleMonth(row.monthKey)}
          >
            <Text className='page-bill__col page-bill__col--month page-bill__month-label'>
              {row.label}
            </Text>
            <Text className='page-bill__col page-bill__amount'>
              {formatTableAmount(row.income)}
            </Text>
            <Text className='page-bill__col page-bill__amount'>
              {formatTableAmount(row.expense)}
            </Text>
            <Text className='page-bill__col page-bill__amount'>
              {formatTableAmount(row.balance)}
            </Text>
          </View>
        ))}
      </View>
    </TabPageShell>
  )
}
