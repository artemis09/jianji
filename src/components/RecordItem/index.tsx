import { View, Text } from '@tarojs/components'
import type { Record, Category } from '@/types'
import { getCategoryColor } from '@/constants/category-colors'
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
  const catName = category?.name || '未分类'
  const catColor = getCategoryColor(catName, record.type)
  const displayName = record.note || catName

  return (
    <View className='record-item pressable' onClick={() => onEdit(record._id)} onLongPress={() => onDelete(record._id)}>
      <View className='record-item__icon' style={{ backgroundColor: `${catColor}22`, borderColor: `${catColor}44` }}>
        <Text className='record-item__icon-text' style={{ color: catColor }}>
          {category?.icon || catName.slice(0, 1)}
        </Text>
      </View>
      <View className='record-item__body'>
        <Text className='record-item__title'>{displayName}</Text>
        <View className='record-item__meta'>
          <Text className='record-item__badge' style={{ backgroundColor: `${catColor}18`, color: catColor }}>
            {catName}
          </Text>
        </View>
      </View>
      <Text className={`record-item__amount ${isExpense ? 'record-item__amount--expense' : 'record-item__amount--income'}`}>
        {sign}{formatAmount(record.amount)}
      </Text>
    </View>
  )
}
