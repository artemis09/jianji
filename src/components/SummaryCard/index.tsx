import { View, Text } from '@tarojs/components'
import { useTheme } from '@/contexts/ThemeContext'
import { formatAmount } from '@/utils/amount'
import './index.scss'

interface SummaryCardProps {
  income: number
  expense: number
  balance: number
}

export default function SummaryCard({ income, expense, balance }: SummaryCardProps) {
  const { themeId } = useTheme()
  const isWarm = themeId === 'warm'

  return (
    <View className={`summary-card ${isWarm ? 'summary-card--warm' : ''}`}>
      <View className='summary-card__inner'>
        <Text className='summary-card__label'>本月结余 (元)</Text>
        <View className='summary-card__balance-row'>
          <Text className='summary-card__currency'>¥</Text>
          <Text className={`summary-card__balance ${isWarm ? 'summary-card__balance--gradient' : ''}`}>
            {formatAmount(balance)}
          </Text>
        </View>
        <View className='summary-card__row'>
          <View className='summary-card__col summary-card__col--income'>
            <View className='summary-card__col-bar summary-card__col-bar--income' />
            <View className='summary-card__col-body'>
              <Text className='summary-card__meta'>收入</Text>
              <Text className='summary-card__value summary-card__income'>¥{formatAmount(income)}</Text>
            </View>
          </View>
          <View className='summary-card__col summary-card__col--expense'>
            <View className='summary-card__col-bar summary-card__col-bar--expense' />
            <View className='summary-card__col-body'>
              <Text className='summary-card__meta'>支出</Text>
              <Text className='summary-card__value summary-card__expense'>¥{formatAmount(expense)}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}
