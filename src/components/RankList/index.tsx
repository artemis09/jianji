import { View, Text } from '@tarojs/components'
import './index.scss'

export interface RankItem {
  name: string
  amount: number
  percent: number
  color: string
}

interface RankListProps {
  items: RankItem[]
}

export default function RankList({ items }: RankListProps) {
  return (
    <View className='rank-list'>
      {items.map(item => (
        <View key={item.name} className='rank-list__row'>
          <View className='rank-list__top'>
            <Text className='rank-list__name'>{item.name}</Text>
            <Text className='rank-list__percent'>{item.percent}%</Text>
          </View>
          <View className='rank-list__bar-bg'>
            <View className='rank-list__bar' style={{ width: `${item.percent}%`, background: item.color }} />
          </View>
        </View>
      ))}
    </View>
  )
}
