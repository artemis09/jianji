import { View, Text, PickerView, PickerViewColumn } from '@tarojs/components'
import { useEffect, useState, type ReactNode } from 'react'
import IceSheet from '@/components/IceSheet'
import { usePickerWheelStyle } from './usePickerWheelStyle'
import './themed-picker.scss'

interface ThemedSelectorPickerProps<T extends string> {
  title: string
  options: T[]
  value: T
  onChange: (value: T) => void
  formatOption?: (value: T) => string
  children: ReactNode
}

export default function ThemedSelectorPicker<T extends string>({
  title,
  options,
  value,
  onChange,
  formatOption = v => v,
  children,
}: ThemedSelectorPickerProps<T>) {
  const wheelStyle = usePickerWheelStyle()
  const [visible, setVisible] = useState(false)
  const [index, setIndex] = useState(() => Math.max(0, options.indexOf(value)))

  useEffect(() => {
    if (!visible) return
    setIndex(Math.max(0, options.indexOf(value)))
  }, [visible, value, options])

  const open = () => setVisible(true)
  const close = () => setVisible(false)

  const confirm = () => {
    const next = options[index]
    if (next) onChange(next)
    close()
  }

  const onPickerChange = (e: { detail: { value: number[] } }) => {
    setIndex(e.detail.value[0] ?? 0)
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
            value={[index]}
            onChange={onPickerChange}
            {...wheelStyle}
          >
            <PickerViewColumn>
              {options.map(opt => (
                <View key={opt} className='themed-picker__item'>
                  <Text>{formatOption(opt)}</Text>
                </View>
              ))}
            </PickerViewColumn>
          </PickerView>
        </View>
      </IceSheet>
    </>
  )
}
