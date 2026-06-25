import { View, Text } from '@tarojs/components'
import type { Record, Category } from '@/types'
import { formatAmount } from '@/utils/amount'
import './index.scss'

interface RecordItemProps {
  record: Record
  category?: Category
  onDelete: (id: string) => void
  onEdit: (id: string) => void
}

export default function RecordItem({ record, category, onDelete, onEdit }: RecordItemProps) {
  const isExpense = record.type === 'expense'
  const sign = isExpense ? '-' : '+'

  return (
    <View
      className='record-item'
      onClick={() => onEdit(record._id)}
      onLongPress={() => onDelete(record._id)}
    >
      <View className='record-item__icon'>
        <Text>{category?.icon || '📝'}</Text>
      </View>
      <View className='record-item__body'>
        <Text className='record-item__title'>{record.note || category?.name || '未命名'}</Text>
        <Text className='record-item__sub'>{category?.name}</Text>
      </View>
      <Text className={`record-item__amount ${isExpense ? 'record-item__amount--expense' : 'record-item__amount--income'}`}>
        {sign}{formatAmount(record.amount)}
      </Text>
    </View>
  )
}
