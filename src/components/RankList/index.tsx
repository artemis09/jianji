import { View, Text } from '@tarojs/components'
import { formatAmount } from '@/utils/amount'
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
  if (items.length === 0) {
    return (
      <View className='rank-list__empty-wrap'>
        <Text className='rank-list__empty'>本月暂无数据</Text>
      </View>
    )
  }

  return (
    <View className='rank-list'>
      {items.map(item => (
        <View key={item.name} className='rank-list__row'>
          <View className='rank-list__top'>
            <View className='rank-list__left'>
              <View className='rank-list__dot' style={{ background: item.color }} />
              <Text className='rank-list__name'>{item.name}</Text>
            </View>
            <View className='rank-list__right'>
              <Text className='rank-list__amount'>¥{formatAmount(item.amount)}</Text>
              <Text className='rank-list__percent'>{item.percent}%</Text>
            </View>
          </View>
          <View className='rank-list__bar-bg'>
            <View className='rank-list__bar' style={{ width: `${item.percent}%`, background: item.color }} />
          </View>
        </View>
      ))}
    </View>
  )
}
