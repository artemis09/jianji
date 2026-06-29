import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface TabBarProps {
  activeTab: 'index' | 'stats'
  onAddClick?: () => void
}

export default function TabBar({ activeTab, onAddClick }: TabBarProps) {
  const go = (url: string) => {
    Taro.redirectTo({ url })
  }

  return (
    <View className='tab-bar'>
      <View
        className={`tab-bar__item pressable ${activeTab === 'index' ? 'tab-bar__item--active' : ''}`}
        onClick={() => go('/pages/index/index')}
      >
        <View className='tab-bar__icon tab-bar__icon--list' />
        <Text className='tab-bar__label'>明细</Text>
      </View>
      <View
        className='tab-bar__fab pressable'
        onClick={() => (onAddClick ? onAddClick() : Taro.navigateTo({ url: '/pages/add/index' }))}
      >
        <Text className='tab-bar__fab-icon'>+</Text>
      </View>
      <View
        className={`tab-bar__item pressable ${activeTab === 'stats' ? 'tab-bar__item--active' : ''}`}
        onClick={() => go('/pages/stats/index')}
      >
        <View className='tab-bar__icon tab-bar__icon--chart' />
        <Text className='tab-bar__label'>统计</Text>
      </View>
    </View>
  )
}
