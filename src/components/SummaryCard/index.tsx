import { View, Text } from '@tarojs/components'
import { useTheme } from '@/contexts/ThemeContext'
import { formatAmount } from '@/utils/amount'
import './index.scss'

interface SummaryCardProps {
  income: number
  expense: number
  balance: number
  budget?: { amount: number; expense: number }
}

export default function SummaryCard({ income, expense, balance, budget }: SummaryCardProps) {
  const { themeId } = useTheme()
  const isWarm = themeId === 'warm'

  const budgetPct = budget ? Math.min((budget.expense / budget.amount) * 100, 100) : 0
  const isOverBudget = budget && budget.expense > budget.amount
  const overAmount = isOverBudget ? budget.expense - budget.amount : 0

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
        {budget && (
          <View className='summary-card__budget'>
            <View className='summary-card__budget-row'>
              <Text className='summary-card__budget-label'>预算</Text>
              <Text className='summary-card__budget-value'>
                ¥{formatAmount(budget.expense)} / ¥{formatAmount(budget.amount)}
              </Text>
            </View>
            <View className='summary-card__budget-bar'>
              <View
                className={`summary-card__budget-fill ${budgetPct >= 90 ? 'summary-card__budget-fill--danger' : ''}`}
                style={{ width: `${budgetPct}%` }}
              />
            </View>
            {isOverBudget && (
              <Text className='summary-card__budget-over'>已超支 ¥{formatAmount(overAmount)}</Text>
            )}
          </View>
        )}
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
