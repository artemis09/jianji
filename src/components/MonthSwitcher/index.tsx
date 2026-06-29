import { View, Text } from '@tarojs/components'
import './index.scss'

interface MonthSwitcherProps {
  month: string
  onChange: (month: string) => void
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  const yy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${yy}-${mm}`
}

export default function MonthSwitcher({ month, onChange }: MonthSwitcherProps) {
  const label = `${month.split('-')[0]}年${Number(month.split('-')[1])}月`

  return (
    <View className='month-switcher'>
      <View className='month-switcher__btn pressable' onClick={() => onChange(shiftMonth(month, -1))}>
        <Text className='month-switcher__arrow'>‹</Text>
      </View>
      <Text className='month-switcher__label'>{label}</Text>
      <View className='month-switcher__btn pressable' onClick={() => onChange(shiftMonth(month, 1))}>
        <Text className='month-switcher__arrow'>›</Text>
      </View>
    </View>
  )
}
