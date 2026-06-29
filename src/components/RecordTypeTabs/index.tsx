import { View, Text } from '@tarojs/components'
import type { RecordType } from '@/types'
import './index.scss'

interface RecordTypeTabsProps {
  value: RecordType
  onChange: (value: RecordType) => void
  onCancel?: () => void
  cancelLabel?: string
}

export default function RecordTypeTabs({
  value,
  onChange,
  onCancel,
  cancelLabel = '取消',
}: RecordTypeTabsProps) {
  return (
    <View className='record-type-tabs'>
      <View className='record-type-tabs__inner'>
        <View
          className={`record-type-tabs__tab pressable ${value === 'expense' ? 'record-type-tabs__tab--active' : ''}`}
          onClick={() => onChange('expense')}
        >
          <Text>支出</Text>
          {value === 'expense' && <View className='record-type-tabs__underline' />}
        </View>
        <View
          className={`record-type-tabs__tab pressable ${value === 'income' ? 'record-type-tabs__tab--active' : ''}`}
          onClick={() => onChange('income')}
        >
          <Text>收入</Text>
          {value === 'income' && <View className='record-type-tabs__underline' />}
        </View>
      </View>
      {onCancel && (
        <Text className='record-type-tabs__cancel pressable' onClick={onCancel}>
          {cancelLabel}
        </Text>
      )}
    </View>
  )
}
