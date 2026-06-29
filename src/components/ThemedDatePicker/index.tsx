import { View, Text, PickerView, PickerViewColumn } from '@tarojs/components'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import IceSheet from '@/components/IceSheet'
import {
  buildDayRange,
  buildYearRange,
  formatDateParts,
  parseDateStr,
} from '@/utils/date'
import { usePickerWheelStyle } from '@/components/ThemedPicker/usePickerWheelStyle'
import '@/components/ThemedPicker/themed-picker.scss'

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const START_YEAR = 2018
const END_YEAR = new Date().getFullYear() + 1
const YEARS = buildYearRange(START_YEAR, END_YEAR)

interface ThemedDatePickerProps {
  value: string
  onChange: (date: string) => void
  children: ReactNode
}

export default function ThemedDatePicker({ value, onChange, children }: ThemedDatePickerProps) {
  const wheelStyle = usePickerWheelStyle()
  const [visible, setVisible] = useState(false)
  const parsed = parseDateStr(value)
  const [year, setYear] = useState(parsed.year)
  const [month, setMonth] = useState(parsed.month)
  const [day, setDay] = useState(parsed.day)

  const days = useMemo(() => buildDayRange(year, month), [year, month])

  const pickerValue = useMemo(() => {
    const yi = Math.max(0, YEARS.indexOf(year))
    const mi = month - 1
    const di = Math.min(day - 1, days.length - 1)
    return [yi, mi, di]
  }, [year, month, day, days.length])

  useEffect(() => {
    if (!visible) return
    const next = parseDateStr(value)
    setYear(next.year)
    setMonth(next.month)
    setDay(next.day)
  }, [visible, value])

  useEffect(() => {
    if (day > days.length) setDay(days.length)
  }, [day, days.length])

  const open = () => setVisible(true)
  const close = () => setVisible(false)

  const confirm = () => {
    onChange(formatDateParts(year, month, day))
    close()
  }

  const onPickerChange = (e: { detail: { value: number[] } }) => {
    const [yi, mi, di] = e.detail.value
    const nextYear = YEARS[yi] ?? year
    const nextMonth = MONTHS[mi] ?? month
    const nextDays = buildDayRange(nextYear, nextMonth)
    const nextDay = nextDays[Math.min(di, nextDays.length - 1)] ?? day
    setYear(nextYear)
    setMonth(nextMonth)
    setDay(nextDay)
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
            <Text className='themed-picker__title'>选择日期</Text>
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
              {YEARS.map(y => (
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
            <PickerViewColumn>
              {days.map(d => (
                <View key={d} className='themed-picker__item'>
                  <Text>{d}日</Text>
                </View>
              ))}
            </PickerViewColumn>
          </PickerView>
        </View>
      </IceSheet>
    </>
  )
}
