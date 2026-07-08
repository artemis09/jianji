import { View, Text } from '@tarojs/components'
import { useState, useMemo, useCallback } from 'react'
import { useDidShow } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useDataRefresh } from '@/hooks/useDataRefresh'
import MonthSwitcher from '@/components/MonthSwitcher'
import PageHeader from '@/components/PageHeader'
import SegToggle from '@/components/SegToggle'
import DonutChart from '@/components/DonutChart'
import TrendChart from '@/components/TrendChart'
import RankList from '@/components/RankList'
import TabPageShell from '@/components/TabPageShell'
import { getRecords } from '@/services/records'
import { getCategories } from '@/services/categories'
import { triggerSync } from '@/services/sync'
import { calcMonthSummary, buildTypedCategoryRank } from '@/utils/stats'
import { formatAmount } from '@/utils/amount'
import { getBudget } from '@/services/budget'
import type { RecordType } from '@/types'
import './index.scss'

function pctChange(current: number, last: number): { pct: string; isUp: boolean } | null {
  if (last === 0) return current > 0 ? { pct: '∞', isUp: current > 0 } : null
  const change = ((current - last) / last) * 100
  return { pct: Math.abs(change).toFixed(1), isUp: change >= 0 }
}

const CHART_COLORS = ['#FFD100', '#FFB800', '#FF9500', '#fb923c', '#4ade80', '#3B82F6']

export default function StatsPage() {
  const pageClass = 'page-stats'
  const now = new Date()
  const [month, setMonth] = useState(now.toISOString().slice(0, 7))
  const [statType, setStatType] = useState<RecordType>('expense')
  const [records, setRecords] = useState(() => getRecords())
  const [categories, setCategories] = useState(() => getCategories())

  const refresh = useCallback(() => {
    setRecords(getRecords())
    setCategories(getCategories())
  }, [])

  useDataRefresh(refresh)

  useDidShow(() => {
    refresh()
    void triggerSync()
  })

  const summary = calcMonthSummary(records, month)
  const chartTotal = statType === 'expense' ? summary.expense : summary.income
  const currentBudget = getBudget(month)

  const rankItems = useMemo(() => {
    const rows = buildTypedCategoryRank(records, categories, month, statType)
    return rows.map((item, i) => ({
      id: item.categoryId,
      name: item.name,
      amount: item.amount,
      percent: item.percent,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }))
  }, [records, categories, month, statType])

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

  return (
    <TabPageShell activeTab='stats' pageClass={pageClass}>
      <PageHeader title='收支统计' />
      <MonthSwitcher month={month} onChange={setMonth} />

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
        <View className='chip' onClick={() => Taro.navigateTo({ url: '/pages/budget/index' })}>
          <Text className='chip__label'>预算</Text>
          {currentBudget ? (
            <>
              <Text className='chip__value'>¥{formatAmount(currentBudget.amount)}</Text>
              <Text className='chip__label'>剩余 ¥{formatAmount(Math.max(currentBudget.amount - summary.expense, 0))}</Text>
            </>
          ) : (
            <Text className='chip__value'>未设置</Text>
          )}
        </View>
      </View>

      <TrendChart data={trendData} />

      <SegToggle value={statType} onChange={setStatType} />

      <DonutChart
        key={statType}
        total={chartTotal}
        label={statType === 'expense' ? '总支出' : '总收入'}
        segments={rankItems}
      />
      <Text className='section-title'>
        {statType === 'expense' ? '支出' : '收入'}分类排行
      </Text>
      <RankList items={rankItems} emptyHint={`本月暂无${statType === 'expense' ? '支出' : '收入'}记录`} />
    </TabPageShell>
  )
}
