import { View, Text } from '@tarojs/components'
import { useTheme } from '@/contexts/ThemeContext'
import type { Record, Category } from '@/types'
import { groupRecordsByDate, formatDateLabel } from '@/utils/date'
import RecordItem from '@/components/RecordItem'
import './index.scss'

interface RecordListProps {
  records: Record[]
  categories: Category[]
  onDelete: (id: string) => void
  onEdit: (id: string) => void
}

export default function RecordList({ records, categories, onDelete, onEdit }: RecordListProps) {
  const { themeId } = useTheme()
  const groups = groupRecordsByDate(records)
  const catMap = new Map(categories.map(c => [c._id, c]))

  return (
    <View className='record-list'>
      {groups.map(group => (
        <View key={group.date} className='record-list__group'>
          <View className={`record-list__header ${themeId === 'warm' ? 'record-list__header--timeline' : ''}`}>
            {themeId === 'warm' && <View className='record-list__timeline' />}
            <Text className='record-list__date'>{formatDateLabel(group.date)}</Text>
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
      ))}
      {groups.length === 0 && (
        <Text className='record-list__empty'>暂无记录，点 + 记一笔</Text>
      )}
    </View>
  )
}
