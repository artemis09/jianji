import { View, Text } from '@tarojs/components'
import type { RecordType } from '@/types'
import './index.scss'

interface SegToggleProps {
  value: RecordType
  onChange: (value: RecordType) => void
}

export default function SegToggle({ value, onChange }: SegToggleProps) {
  return (
    <View className={`seg-toggle seg-toggle--${value}`}>
      <Text
        className={`seg-toggle__tab pressable ${value === 'expense' ? 'seg-toggle__tab--active' : ''}`}
        onClick={() => onChange('expense')}
      >
        支出
      </Text>
      <Text
        className={`seg-toggle__tab pressable ${value === 'income' ? 'seg-toggle__tab--active' : ''}`}
        onClick={() => onChange('income')}
      >
        收入
      </Text>
    </View>
  )
}
