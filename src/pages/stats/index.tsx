import { View, Text, Picker } from '@tarojs/components'
import { useState } from 'react'
import { useDidShow } from '@tarojs/taro'
import TabBar from '@/components/TabBar'
import DonutChart from '@/components/DonutChart'
import RankList from '@/components/RankList'
import { getRecords } from '@/services/records'
import { getCategories } from '@/services/categories'
import { calcMonthSummary, calcCategoryBreakdown } from '@/utils/stats'
import './index.scss'

const CHART_COLORS = ['#FFD100', '#FFB800', '#FF9500', '#fb923c', '#4ade80']

export default function StatsPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.toISOString().slice(0, 7))
  const [records, setRecords] = useState(() => getRecords())
  const [categories, setCategories] = useState(() => getCategories())

  useDidShow(() => {
    setRecords(getRecords())
    setCategories(getCategories())
  })

  const summary = calcMonthSummary(records, month)
  const breakdown = calcCategoryBreakdown(records, month, 'expense')
  const catMap = new Map(categories.map(c => [c._id, c]))

  const rankItems = breakdown.map((item, i) => ({
    name: catMap.get(item.categoryId)?.name || '其他',
    amount: item.amount,
    percent: item.percent,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }))

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), i, 1)
    return d.toISOString().slice(0, 7)
  })

  return (
    <View className='page-stats'>
      <View className='page-stats__header'>
        <Text className='page-stats__title'>收支统计</Text>
        <Picker
          mode='selector'
          range={monthOptions}
          value={monthOptions.indexOf(month)}
          onChange={e => setMonth(monthOptions[Number(e.detail.value)])}
        >
          <Text className='page-stats__picker'>{Number(month.split('-')[1])}月 ▼</Text>
        </Picker>
      </View>

      <DonutChart total={summary.expense} label='总支出' />
      <RankList items={rankItems} />
      <TabBar activeTab='stats' />
    </View>
  )
}
