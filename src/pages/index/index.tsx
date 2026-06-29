import { View, Text, Button } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro, { useReady, useDidShow } from '@tarojs/taro'
import ProfileEntry from '@/components/ProfileEntry'
import MonthSwitcher from '@/components/MonthSwitcher'
import AddSheet from '@/components/AddSheet'
import SummaryCard from '@/components/SummaryCard'
import RecordList from '@/components/RecordList'
import AppTabBar from '@/components/AppTabBar'
import { useTabBarPage } from '@/hooks/useTabBarPage'
import { useThemePageClass } from '@/hooks/useThemePageClass'
import { getBudget } from '@/services/budget'
import { getRecords, deleteRecord } from '@/services/records'
import { getCategories } from '@/services/categories'
import { calcMonthSummary } from '@/utils/stats'
import { storage } from '@/services/storage'
import { triggerSync } from '@/services/sync'
import './index.scss'

export default function Index() {
  const pageClass = useThemePageClass('page page-index')
  useTabBarPage()
  const hasPhone = !!storage.getUser()?.phone
  const [records, setRecords] = useState(() => getRecords())
  const [categories, setCategories] = useState(() => getCategories())
  const [pageReady, setPageReady] = useState(false)
  const [addVisible, setAddVisible] = useState(false)
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))

  const monthRecords = useMemo(
    () => records.filter(r => r.syncStatus !== 'deleted' && r.date.startsWith(month)),
    [records, month],
  )
  const summary = calcMonthSummary(records, month)
  const currentBudget = getBudget(month)

  const refresh = () => {
    setRecords(getRecords())
    setCategories(getCategories())
  }

  useReady(() => {
    setPageReady(true)
    Taro.eventCenter.on('openAddSheet', () => {
      setAddVisible(true)
    })
    Taro.eventCenter.on('setIndexMonth', (m: string) => {
      if (m) setMonth(m)
    })
    if (!storage.getUser()?.phone) return
    refresh()
    setTimeout(() => {
      void triggerSync()
    }, 3000)
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
      <View className={`${pageClass} auth-gate`}>
        <Text className='auth-gate__title'>简记</Text>
        <Text className='auth-gate__desc'>绑定手机号后即可开始记账，数据将安全保存在云端</Text>
        <Button
          className='auth-gate__btn'
          onClick={() => Taro.navigateTo({ url: '/pages/login/index' })}
        >
          去登录
        </Button>
      </View>
    )
  }

  if (!pageReady) {
    return <View className={pageClass} />
  }

  return (
    <View className={pageClass}>
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
      <AddSheet visible={addVisible} onClose={() => setAddVisible(false)} onSaved={refresh} />
      {!addVisible && <AppTabBar activeTab='index' />}
    </View>
  )
}
