import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { storage } from '@/services/storage'
import { useAuth } from '@/contexts/AuthContext'
import './index.scss'

const MENU = [
  { title: '外观主题', url: '/pages/theme/index' },
  { title: '分类管理', url: '/pages/categories/index' },
  { title: '关于', action: 'about' as const },
]

export default function ProfilePage() {
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
    <View className='page-profile'>
      <View className='page-profile__header'>
        <Text className='page-profile__phone'>{user?.phone || '未绑定手机'}</Text>
        <Text className='page-profile__sync'>待同步 {pending} 条</Text>
      </View>
      {MENU.map(item => (
        <View key={item.title} className='page-profile__item' onClick={() => onItem(item)}>
          <Text>{item.title}</Text>
          <Text className='page-profile__arrow'>›</Text>
        </View>
      ))}
    </View>
  )
}
