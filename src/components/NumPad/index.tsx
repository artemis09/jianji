import { View, Text } from '@tarojs/components'
import './index.scss'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'] as const

interface NumPadProps {
  onInput: (key: string) => void
}

export default function NumPad({ onInput }: NumPadProps) {
  return (
    <View className='num-pad'>
      {KEYS.map(key => (
        <View key={key} className='num-pad__key' onClick={() => onInput(key)}>
          <Text>{key === 'del' ? '⌫' : key}</Text>
        </View>
      ))}
    </View>
  )
}
