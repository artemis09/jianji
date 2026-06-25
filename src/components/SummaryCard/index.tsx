import { View, Text } from '@tarojs/components'
import { useTheme } from '@/contexts/ThemeContext'
import { formatAmount } from '@/utils/amount'
import './index.scss'

interface SummaryCardProps {
  income: number
  expense: number
  balance: number
  monthLabel: string
}

export default function SummaryCard({ income, expense, balance, monthLabel }: SummaryCardProps) {
  const { themeId } = useTheme()
  const isWarm = themeId === 'warm'

  return (
    <View className={`summary-card ${isWarm ? 'summary-card--warm' : ''}`}>
      <View className='summary-card__inner'>
        <Text className='summary-card__label'>{monthLabel} 结余</Text>
        <Text className={`summary-card__balance ${isWarm ? 'summary-card__balance--gradient' : ''}`}>
          {formatAmount(balance)}
        </Text>
        <View className='summary-card__row'>
          <Text className='summary-card__meta'>收入 <Text className='summary-card__income'>{formatAmount(income)}</Text></Text>
          <Text className='summary-card__meta'>支出 <Text className='summary-card__expense'>{formatAmount(expense)}</Text></Text>
        </View>
      </View>
    </View>
  )
}
