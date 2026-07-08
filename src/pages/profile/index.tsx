import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useAuth } from '@/contexts/AuthContext'
import TabPageShell from '@/components/TabPageShell'
import PageHeader from '@/components/PageHeader'
import { clearAllUserData } from '@/services/data-reset'
import { getPendingSyncCount, triggerFullSync } from '@/services/sync'
import './index.scss'

const MENU = [
  { title: '外观主题', url: '/pages/theme/index' },
  { title: '预算设置', url: '/pages/budget/index' },
  { title: '分类管理', url: '/pages/categories/index' },
  { title: '用户服务协议', url: '/pages/agreement/index' },
  { title: '隐私政策', url: '/pages/privacy/index' },
  { title: '关于', action: 'about' as const },
]

export default function ProfilePage() {
  const pageClass = 'page-profile'
  const { user } = useAuth()
  const [pending, setPending] = useState(() => getPendingSyncCount())
  const [syncing, setSyncing] = useState(false)
  const [clearing, setClearing] = useState(false)

  const refreshPending = () => setPending(getPendingSyncCount())

  useDidShow(() => {
    refreshPending()
  })

  const handleSync = async () => {
    if (syncing) return
    setSyncing(true)
    Taro.showLoading({ title: '同步中…', mask: true })
    try {
      const result = await triggerFullSync()
      refreshPending()
      const pulled = result.pulledRecords + result.pulledCategories
      if (result.complete && result.syncedCount === 0 && pulled === 0) {
        Taro.showToast({ title: '已是最新数据', icon: 'success' })
      } else if (result.complete) {
        const parts: string[] = []
        if (result.syncedCount > 0) parts.push(`上传 ${result.syncedCount} 条`)
        if (result.pulledRecords > 0) parts.push(`记录 ${result.pulledRecords} 条`)
        if (result.pulledCategories > 0) parts.push(`分类 ${result.pulledCategories} 个`)
        Taro.showToast({
          title: parts.length > 0 ? `同步完成：${parts.join('，')}` : '同步完成',
          icon: 'success',
        })
      } else if (result.syncedCount > 0 || pulled > 0) {
        Taro.showToast({
          title: `部分完成，${result.remainingCount} 条待重试`,
          icon: 'none',
        })
      } else {
        Taro.showToast({ title: '同步失败，请稍后重试', icon: 'none' })
      }
    } finally {
      Taro.hideLoading()
      setSyncing(false)
    }
  }

  const handleClearData = () => {
    if (clearing || !user?.openid) return
    Taro.showModal({
      title: '清除全部数据',
      content: '将删除所有账单、分类和预算，恢复为初始状态。本地与云端数据均不可恢复，是否继续？',
      confirmText: '确认清除',
      confirmColor: '#ff453a',
      success: async res => {
        if (!res.confirm) return
        setClearing(true)
        Taro.showLoading({ title: '清除中…', mask: true })
        try {
          const result = await clearAllUserData(user.openid)
          refreshPending()
          Taro.showToast({
            title: result.cloudCleared ? '已恢复初始状态' : '本地已清除，云端待联网同步',
            icon: result.cloudCleared ? 'success' : 'none',
          })
          setTimeout(() => {
            Taro.reLaunch({ url: '/pages/index/index' })
          }, 600)
        } catch (err) {
          const msg = err instanceof Error ? err.message : '清除失败，请稍后重试'
          Taro.showModal({ title: '清除失败', content: msg, showCancel: false })
        } finally {
          Taro.hideLoading()
          setClearing(false)
        }
      },
    })
  }

  const onItem = (item: (typeof MENU)[0]) => {
    if (item.action === 'about') {
      Taro.showModal({ title: '简记', content: 'v1.0.0\n个人记账小程序', showCancel: false })
      return
    }
    if (item.url) Taro.navigateTo({ url: item.url })
  }

  return (
    <TabPageShell activeTab='profile' pageClass={pageClass}>
      <PageHeader title='我的' />
      <View className='page__body'>
        <View className='surface-card page-profile__user'>
          <Text className='page-profile__phone'>{user?.phone || '未绑定手机'}</Text>
          <Text className='page-profile__sync'>待上传 {pending} 条</Text>
          <View
            className={`page-profile__sync-btn pressable${syncing ? ' page-profile__sync-btn--disabled' : ''}`}
            onClick={handleSync}
          >
            <Text>{syncing ? '同步中…' : '立即同步'}</Text>
          </View>
        </View>
        {MENU.map(item => (
          <View key={item.title} className='list-row pressable' onClick={() => onItem(item)}>
            <Text>{item.title}</Text>
            <Text className='list-row__arrow'>›</Text>
          </View>
        ))}
        <View
          className={`list-row list-row--danger pressable${clearing ? ' list-row--disabled' : ''}`}
          onClick={handleClearData}
        >
          <Text>清除数据</Text>
          <Text className='list-row__arrow'>›</Text>
        </View>
      </View>
    </TabPageShell>
  )
}
