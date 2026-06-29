import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import TabIcon from '@/components/TabIcon'
import type { AppTabKey } from './types'
import './index.scss'

const TABS: Array<{ key: AppTabKey; route: string; label: string; icon: 'list' | 'chart' | 'bill' | 'profile' }> = [
  { key: 'index', route: 'pages/index/index', label: '明细', icon: 'list' },
  { key: 'stats', route: 'pages/stats/index', label: '图表', icon: 'chart' },
  { key: 'bill', route: 'pages/bill/index', label: '账单', icon: 'bill' },
  { key: 'profile', route: 'pages/profile/index', label: '我的', icon: 'profile' },
]

interface AppTabBarProps {
  activeTab: AppTabKey
}

export default function AppTabBar({ activeTab }: AppTabBarProps) {
  const goTab = (route: string, key: AppTabKey) => {
    if (activeTab === key) return
    Taro.switchTab({ url: `/${route}` })
  }

  const handleAdd = () => {
    if (activeTab === 'index') {
      Taro.eventCenter.trigger('openAddSheet')
      return
    }
    Taro.switchTab({ url: '/pages/index/index' })
    setTimeout(() => Taro.eventCenter.trigger('openAddSheet'), 300)
  }

  return (
    <View className='app-tab-bar'>
      <View className='app-tab-bar__inner'>
        {TABS.slice(0, 2).map(tab => (
          <View
            key={tab.key}
            className={`app-tab-bar__item pressable ${activeTab === tab.key ? 'app-tab-bar__item--active' : ''}`}
            onClick={() => goTab(tab.route, tab.key)}
          >
            <TabIcon name={tab.icon} active={activeTab === tab.key} />
            <Text className='app-tab-bar__label'>{tab.label}</Text>
          </View>
        ))}

        <View className='app-tab-bar__fab-slot'>
          <View className='app-tab-bar__fab pressable' onClick={handleAdd}>
            <TabIcon name='add' size='fab' />
          </View>
          <Text className='app-tab-bar__fab-label'>记账</Text>
        </View>

        {TABS.slice(2).map(tab => (
          <View
            key={tab.key}
            className={`app-tab-bar__item pressable ${activeTab === tab.key ? 'app-tab-bar__item--active' : ''}`}
            onClick={() => goTab(tab.route, tab.key)}
          >
            <TabIcon name={tab.icon} active={activeTab === tab.key} />
            <Text className='app-tab-bar__label'>{tab.label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
