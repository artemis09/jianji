import { View, Text, PickerView, PickerViewColumn } from '@tarojs/components'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import IceSheet from '@/components/IceSheet'
import { buildYearRange } from '@/utils/date'
import { usePickerWheelStyle } from './usePickerWheelStyle'
import './themed-picker.scss'

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

interface ThemedMonthPickerProps {
  value: string
  onChange: (month: string) => void
  children: ReactNode
  title?: string
  startYear?: number
}

function parseMonthValue(value: string): { year: number; month: number } {
  const [y, m] = value.split('-').map(Number)
  const now = new Date()
  return {
    year: y || now.getFullYear(),
    month: m || now.getMonth() + 1,
  }
}

export default function ThemedMonthPicker({
  value,
  onChange,
  children,
  title = '选择月份',
  startYear = 2018,
}: ThemedMonthPickerProps) {
  const wheelStyle = usePickerWheelStyle()
  const endYear = new Date().getFullYear()
  const years = useMemo(() => buildYearRange(startYear, endYear), [startYear, endYear])

  const [visible, setVisible] = useState(false)
  const parsed = parseMonthValue(value)
  const [year, setYear] = useState(parsed.year)
  const [month, setMonth] = useState(parsed.month)

  const pickerValue = useMemo(() => {
    const yi = Math.max(0, years.indexOf(year))
    return [yi, month - 1]
  }, [year, month, years])

  useEffect(() => {
    if (!visible) return
    const next = parseMonthValue(value)
    setYear(next.year)
    setMonth(next.month)
  }, [visible, value])

  const open = () => setVisible(true)
  const close = () => setVisible(false)

  const confirm = () => {
    const mm = String(month).padStart(2, '0')
    onChange(`${year}-${mm}`)
    close()
  }

  const onPickerChange = (e: { detail: { value: number[] } }) => {
    const [yi, mi] = e.detail.value
    setYear(years[yi] ?? year)
    setMonth(MONTHS[mi] ?? month)
  }

  return (
    <>
      <View className='themed-picker__trigger' onClick={open}>
        {children}
      </View>
      <IceSheet visible={visible} onClose={close}>
        <View className='themed-picker'>
          <View className='themed-picker__header'>
            <Text className='themed-picker__action pressable' onClick={close}>取消</Text>
            <Text className='themed-picker__title'>{title}</Text>
            <Text className='themed-picker__action themed-picker__action--confirm pressable' onClick={confirm}>
              确定
            </Text>
          </View>
          <PickerView
            className='themed-picker__wheel'
            value={pickerValue}
            onChange={onPickerChange}
            {...wheelStyle}
          >
            <PickerViewColumn>
              {years.map(y => (
                <View key={y} className='themed-picker__item'>
                  <Text>{y}年</Text>
                </View>
              ))}
            </PickerViewColumn>
            <PickerViewColumn>
              {MONTHS.map(m => (
                <View key={m} className='themed-picker__item'>
                  <Text>{m}月</Text>
                </View>
              ))}
            </PickerViewColumn>
          </PickerView>
        </View>
      </IceSheet>
    </>
  )
}
