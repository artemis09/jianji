import { View, Text, Button } from '@tarojs/components'
import { useState, useMemo, useCallback } from 'react'
import Taro, { useReady, useDidShow } from '@tarojs/taro'
import { useDataRefresh } from '@/hooks/useDataRefresh'
import LegalLinks from '@/components/LegalLinks'
import ProfileEntry from '@/components/ProfileEntry'
import MonthSwitcher from '@/components/MonthSwitcher'
import AddSheet from '@/components/AddSheet'
import SummaryCard from '@/components/SummaryCard'
import RecordList from '@/components/RecordList'
import TabPageShell from '@/components/TabPageShell'
import { useTheme } from '@/contexts/ThemeContext'
import { useThemePageClass } from '@/hooks/useThemePageClass'
import { useThemeBackground } from '@/hooks/useThemeBackground'
import { getBudget } from '@/services/budget'
import { getRecords, deleteRecord } from '@/services/records'
import { getCategories } from '@/services/categories'
import { calcMonthSummary } from '@/utils/stats'
import { storage } from '@/services/storage'
import './index.scss'

export default function Index() {
  const themeClass = useThemePageClass('page')
  const { theme } = useTheme()
  useThemeBackground()
  const hasPhone = !!storage.getUser()?.phone
  const [records, setRecords] = useState(() => getRecords())
  const [categories, setCategories] = useState(() => getCategories())
  const [addVisible, setAddVisible] = useState(false)
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))

  const monthRecords = useMemo(
    () => records.filter(r => r.syncStatus !== 'deleted' && r.date.startsWith(month)),
    [records, month],
  )
  const summary = calcMonthSummary(records, month)
  const currentBudget = getBudget(month)

  const refresh = useCallback(() => {
    setRecords(getRecords())
    setCategories(getCategories())
  }, [])

  useDataRefresh(refresh)

  useReady(() => {
    Taro.eventCenter.on('openAddSheet', () => {
      setAddVisible(true)
    })
    Taro.eventCenter.on('setIndexMonth', (m: string) => {
      if (m) setMonth(m)
    })
  })

  useDidShow(() => {
    refresh()
  })

  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '删除记录',
      content: '确定删除这条记录吗？',
      success: res => {
        if (res.confirm) {
          deleteRecord(id)
          refresh()
        }
      },
    })
  }

  const handleEdit = (id: string) => {
    Taro.navigateTo({ url: `/pages/add/index?id=${id}` })
  }

  if (!hasPhone) {
    return (
      <View className={`${themeClass} auth-gate`} style={{ backgroundColor: theme.pageBg }}>
        <Text className='auth-gate__title'>简记</Text>
        <Text className='auth-gate__desc'>绑定手机号后即可开始记账，数据将安全保存在云端</Text>
        <Button
          className='auth-gate__btn'
          onClick={() => Taro.navigateTo({ url: '/pages/login/index' })}
        >
          去登录
        </Button>
        <LegalLinks
          className='auth-gate__legal'
          prefix='登录前请阅读并同意'
          suffix='。绑定手机号仅用于账号识别与数据同步。'
        />
      </View>
    )
  }

  return (
    <TabPageShell
      activeTab='index'
      pageClass='page-index'
      hideTabBar={addVisible}
      overlay={
        <AddSheet
          visible={addVisible}
          categories={categories}
          onClose={() => setAddVisible(false)}
          onSaved={refresh}
        />
      }
    >
      <ProfileEntry />
      <MonthSwitcher month={month} onChange={setMonth} />
      <SummaryCard
        income={summary.income}
        expense={summary.expense}
        balance={summary.balance}
        budget={currentBudget ? { amount: currentBudget.amount, expense: summary.expense } : undefined}
      />
      <RecordList
        records={monthRecords}
        categories={categories}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </TabPageShell>
  )
}
