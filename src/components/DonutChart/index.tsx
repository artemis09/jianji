import { View, Text } from '@tarojs/components'
import { formatAmount } from '@/utils/amount'
import './index.scss'

interface DonutChartProps {
  total: number
  label: string
}

export default function DonutChart({ total, label }: DonutChartProps) {
  return (
    <View className='donut-chart'>
      <View className='donut-chart__ring'>
        <View className='donut-chart__hole'>
          <Text className='donut-chart__label'>{label}</Text>
          <Text className='donut-chart__total'>{formatAmount(total)}</Text>
        </View>
      </View>
    </View>
  )
}
