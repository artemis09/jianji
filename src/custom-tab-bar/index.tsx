import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default function CustomTabBar() {
  const currentPage = Taro.getCurrentPages()[0]?.route || 'pages/index/index'

  const goTab = (url: string) => {
    Taro.switchTab({ url: `/${url}` })
  }

  return (
    <View className='custom-tab-bar'>
      <View
        className={`custom-tab-bar__item ${currentPage === 'pages/index/index' ? 'custom-tab-bar__item--active' : ''}`}
        onClick={() => goTab('pages/index/index')}
      >
        <View className='custom-tab-bar__icon custom-tab-bar__icon--list' />
        <Text className='custom-tab-bar__label'>明细</Text>
      </View>
      <View
        className='custom-tab-bar__fab'
        onClick={() => Taro.eventCenter.trigger('openAddSheet')}
      >
        <Text className='custom-tab-bar__fab-icon'>+</Text>
      </View>
      <View
        className={`custom-tab-bar__item ${currentPage === 'pages/stats/index' ? 'custom-tab-bar__item--active' : ''}`}
        onClick={() => goTab('pages/stats/index')}
      >
        <View className='custom-tab-bar__icon custom-tab-bar__icon--chart' />
        <Text className='custom-tab-bar__label'>统计</Text>
      </View>
    </View>
  )
}
