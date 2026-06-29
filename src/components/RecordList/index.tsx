import { View, Text } from '@tarojs/components'
import { useTheme } from '@/contexts/ThemeContext'
import type { Record, Category } from '@/types'
import { groupRecordsByDate, formatDateLabel } from '@/utils/date'
import { formatAmount } from '@/utils/amount'
import RecordItem from '@/components/RecordItem'
import './index.scss'

interface RecordListProps {
  records: Record[]
  categories: Category[]
  onDelete: (id: string) => void
  onEdit: (id: string) => void
}

function dayTotal(items: Record[]): { expense: number; income: number } {
  let expense = 0
  let income = 0
  for (const r of items) {
    if (r.type === 'expense') expense += r.amount
    else income += r.amount
  }
  return { expense, income }
}

export default function RecordList({ records, categories, onDelete, onEdit }: RecordListProps) {
  const { themeId } = useTheme()
  const groups = groupRecordsByDate(records)
  const catMap = new Map(categories.map(c => [c._id, c]))

  return (
    <View className='record-list'>
      <Text className='section-title'>账单明细</Text>
      {groups.map(group => {
        const { expense, income } = dayTotal(group.items)
        return (
          <View key={group.date} className='record-list__group'>
            <View className={`record-list__header ${themeId === 'warm' ? 'record-list__header--timeline' : ''}`}>
              {themeId === 'warm' && <View className='record-list__timeline' />}
              <View className='record-list__header-main'>
                <Text className='record-list__date'>{formatDateLabel(group.date)}</Text>
                <Text className='record-list__day-total'>
                  {expense > 0 && <Text className='record-list__day-expense'>支 ¥{formatAmount(expense)}</Text>}
                  {income > 0 && <Text className='record-list__day-income'>收 ¥{formatAmount(income)}</Text>}
                </Text>
              </View>
            </View>
            <View className='record-list__items'>
              {group.items.map(item => (
                <RecordItem
                  key={item._id}
                  record={item}
                  category={catMap.get(item.categoryId)}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
            </View>
          </View>
        )
      })}
      {groups.length === 0 && (
        <View className='record-list__empty-wrap'>
          <Text className='record-list__empty-title'>还没有账单</Text>
          <Text className='record-list__empty'>点击底部 + 按钮，3 秒记一笔</Text>
        </View>
      )}
    </View>
  )
}
