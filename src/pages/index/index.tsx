import { View } from '@tarojs/components'
import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import ProfileEntry from '@/components/ProfileEntry'
import SummaryCard from '@/components/SummaryCard'
import RecordList from '@/components/RecordList'
import TabBar from '@/components/TabBar'
import { getRecords, deleteRecord } from '@/services/records'
import { getCategories } from '@/services/categories'
import { calcMonthSummary } from '@/utils/stats'
import { useAuth } from '@/contexts/AuthContext'
import './index.scss'

export default function Index() {
  const { user } = useAuth()
  const [records, setRecords] = useState(() => getRecords())
  const [categories, setCategories] = useState(() => getCategories())

  const month = new Date().toISOString().slice(0, 7)
  const summary = calcMonthSummary(records, month)

  const refresh = () => {
    setRecords(getRecords())
    setCategories(getCategories())
  }

  useDidShow(refresh)

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

  return (
    <View className='page-index'>
      <ProfileEntry />
      <SummaryCard
        income={summary.income}
        expense={summary.expense}
        balance={summary.balance}
        monthLabel={`${month.split('-')[1]}月`}
      />
      <RecordList
        records={records.filter(r => !user?.openid || r.userId === user.openid)}
        categories={categories}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
      <TabBar activeTab='index' />
    </View>
  )
}
