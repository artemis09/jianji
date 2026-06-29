import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAuth } from '@/contexts/AuthContext'
import { useThemePageClass } from '@/hooks/useThemePageClass'
import PageHeader from '@/components/PageHeader'
import { storage } from '@/services/storage'
import './index.scss'

const MENU = [
  { title: '外观主题', url: '/pages/theme/index' },
  { title: '分类管理', url: '/pages/categories/index' },
  { title: '关于', action: 'about' as const },
]

export default function ProfilePage() {
  const pageClass = useThemePageClass('page page-profile')
  const { user } = useAuth()
  const pending = storage.getPendingQueue().length

  const onItem = (item: (typeof MENU)[0]) => {
    if (item.action === 'about') {
      Taro.showModal({ title: '简记', content: 'v1.0.0\n个人记账小程序', showCancel: false })
      return
    }
    if (item.url) Taro.navigateTo({ url: item.url })
  }

  return (
    <View className={pageClass}>
      <PageHeader title='我的' left='back' />
      <View className='page__body'>
        <View className='surface-card page-profile__user'>
          <Text className='page-profile__phone'>{user?.phone || '未绑定手机'}</Text>
          <Text className='page-profile__sync'>待同步 {pending} 条</Text>
        </View>
        {MENU.map(item => (
          <View key={item.title} className='list-row pressable' onClick={() => onItem(item)}>
            <Text>{item.title}</Text>
            <Text className='list-row__arrow'>›</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
