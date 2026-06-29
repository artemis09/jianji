import { View, Text, Picker } from '@tarojs/components'
import { useState, useMemo } from 'react'
import { useDidShow } from '@tarojs/taro'
import PageHeader from '@/components/PageHeader'
import SegToggle from '@/components/SegToggle'
import DonutChart from '@/components/DonutChart'
import TrendChart from '@/components/TrendChart'
import RankList from '@/components/RankList'
import { useThemePageClass } from '@/hooks/useThemePageClass'
import { getRecords } from '@/services/records'
import { getCategories } from '@/services/categories'
import { calcMonthSummary, calcCategoryBreakdown } from '@/utils/stats'
import { formatAmount } from '@/utils/amount'
import type { RecordType } from '@/types'
import './index.scss'

function pctChange(current: number, last: number): { pct: string; isUp: boolean } | null {
  if (last === 0) return current > 0 ? { pct: '∞', isUp: current > 0 } : null
  const change = ((current - last) / last) * 100
  return { pct: Math.abs(change).toFixed(1), isUp: change >= 0 }
}

const CHART_COLORS = ['#FFD100', '#FFB800', '#FF9500', '#fb923c', '#4ade80', '#3B82F6']

export default function StatsPage() {
  const pageClass = useThemePageClass('page page-stats')
  const now = new Date()
  const [month, setMonth] = useState(now.toISOString().slice(0, 7))
  const [statType, setStatType] = useState<RecordType>('expense')
  const [records, setRecords] = useState(() => getRecords())
  const [categories, setCategories] = useState(() => getCategories())

  useDidShow(() => {
    setRecords(getRecords())
    setCategories(getCategories())
  })

  const summary = calcMonthSummary(records, month)
  const breakdown = calcCategoryBreakdown(records, month, statType)
  const catMap = new Map(categories.map(c => [c._id, c]))

  const rankItems = breakdown.map((item, i) => ({
    name: catMap.get(item.categoryId)?.name || '其他',
    amount: item.amount,
    percent: item.percent,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }))

  const monthOptions = useMemo(
    () => Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), i, 1)
      return d.toISOString().slice(0, 7)
    }),
    [now],
  )

  const chartTotal = statType === 'expense' ? summary.expense : summary.income

  const trendData = useMemo(() => {
    const months: string[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(d.toISOString().slice(0, 7))
    }
    return months.map(m => {
      const s = calcMonthSummary(records, m)
      return { month: m, income: s.income, expense: s.expense }
    })
  }, [records, now])

  const monthPicker = (
    <Picker
      mode='selector'
      range={monthOptions}
      value={monthOptions.indexOf(month)}
      onChange={e => setMonth(monthOptions[Number(e.detail.value)])}
    >
      <View className='month-pill pressable'>
        <Text>{Number(month.split('-')[1])}月</Text>
        <Text className='month-pill__arrow'>▼</Text>
      </View>
    </Picker>
  )

  return (
    <View className={pageClass}>
      <PageHeader title='收支统计' right={monthPicker} />

      <View className='chip-row'>
        <View className='chip'>
          <Text className='chip__label'>收入</Text>
          <Text className='chip__value chip__value--income'>¥{formatAmount(summary.income)}</Text>
          {(() => {
            const cmp = pctChange(summary.income, summary.lastIncome)
            if (!cmp) return null
            return (
              <Text className={`chip__compare ${cmp.isUp ? 'chip__compare--up' : 'chip__compare--down'}`}>
                {cmp.isUp ? '↑' : '↓'}{cmp.pct}%
              </Text>
            )
          })()}
        </View>
        <View className='chip'>
          <Text className='chip__label'>支出</Text>
          <Text className='chip__value chip__value--expense'>¥{formatAmount(summary.expense)}</Text>
          {(() => {
            const cmp = pctChange(summary.expense, summary.lastExpense)
            if (!cmp) return null
            return (
              <Text className={`chip__compare ${!cmp.isUp ? 'chip__compare--up' : 'chip__compare--down'}`}>
                {!cmp.isUp ? '↑' : '↓'}{cmp.pct}%
              </Text>
            )
          })()}
        </View>
        <View className='chip'>
          <Text className='chip__label'>结余</Text>
          <Text className='chip__value'>¥{formatAmount(summary.balance)}</Text>
        </View>
      </View>

      <TrendChart data={trendData} />

      <SegToggle value={statType} onChange={setStatType} />

      <DonutChart
        total={chartTotal}
        label={statType === 'expense' ? '总支出' : '总收入'}
        segments={rankItems}
      />
      <Text className='section-title'>分类排行</Text>
      <RankList items={rankItems} />
    </View>
  )
}
