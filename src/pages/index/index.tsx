import { View, Text, Button } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro, { useReady } from '@tarojs/taro'
import ProfileEntry from '@/components/ProfileEntry'
import MonthSwitcher from '@/components/MonthSwitcher'
import SummaryCard from '@/components/SummaryCard'
import RecordList from '@/components/RecordList'
import TabBar from '@/components/TabBar'
import { useThemePageClass } from '@/hooks/useThemePageClass'
import { getRecords, deleteRecord } from '@/services/records'
import { getCategories } from '@/services/categories'
import { calcMonthSummary } from '@/utils/stats'
import { storage } from '@/services/storage'
import { triggerSync } from '@/services/sync'
import './index.scss'

export default function Index() {
  const pageClass = useThemePageClass('page page-index')
  const hasPhone = !!storage.getUser()?.phone
  const [records, setRecords] = useState(() => getRecords())
  const [categories, setCategories] = useState(() => getCategories())
  const [pageReady, setPageReady] = useState(false)
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))

  const monthRecords = useMemo(
    () => records.filter(r => r.syncStatus !== 'deleted' && r.date.startsWith(month)),
    [records, month],
  )
  const summary = calcMonthSummary(records, month)

  const refresh = () => {
    setRecords(getRecords())
    setCategories(getCategories())
  }

  useReady(() => {
    setPageReady(true)
    if (!storage.getUser()?.phone) return
    refresh()
    setTimeout(() => {
      void triggerSync()
    }, 3000)
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
      />
      <RecordList
        records={monthRecords}
        categories={categories}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
      <TabBar activeTab='index' />
    </View>
  )
}
