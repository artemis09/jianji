import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface TabBarProps {
  activeTab: 'index' | 'stats'
}

export default function TabBar({ activeTab }: TabBarProps) {
  const go = (url: string) => {
    Taro.redirectTo({ url })
  }

  return (
    <View className='tab-bar'>
      <View
        className={`tab-bar__item ${activeTab === 'index' ? 'tab-bar__item--active' : ''}`}
        onClick={() => go('/pages/index/index')}
      >
        <Text>明细</Text>
      </View>
      <View
        className='tab-bar__fab'
        onClick={() => Taro.navigateTo({ url: '/pages/add/index' })}
      >
        <Text className='tab-bar__fab-icon'>+</Text>
      </View>
      <View
        className={`tab-bar__item ${activeTab === 'stats' ? 'tab-bar__item--active' : ''}`}
        onClick={() => go('/pages/stats/index')}
      >
        <Text>统计</Text>
      </View>
    </View>
  )
}
