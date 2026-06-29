import { View } from '@tarojs/components'
import { useEffect, useState } from 'react'
import type { PropsWithChildren } from 'react'
import './index.scss'

interface IceSheetProps {
  visible: boolean
  onClose: () => void
}

export default function IceSheet({ visible, onClose, children }: PropsWithChildren<IceSheetProps>) {
  const [animState, setAnimState] = useState<'enter' | 'exit' | 'hidden'>('hidden')

  useEffect(() => {
    if (visible) {
      setAnimState('enter')
    } else if (animState === 'enter') {
      setAnimState('exit')
      const timer = setTimeout(() => setAnimState('hidden'), 300)
      return () => clearTimeout(timer)
    }
  }, [visible])

  if (animState === 'hidden') return null

  const sheetClass = `ice-sheet ${animState === 'enter' ? 'ice-sheet--enter' : 'ice-sheet--exit'}`
  const maskClass = `ice-sheet__mask ${animState === 'enter' ? 'ice-sheet__mask--enter' : 'ice-sheet__mask--exit'}`

  return (
    <View className={sheetClass}>
      <View className={maskClass} onClick={onClose} />
      <View className='ice-sheet__content'>
        <View className='ice-sheet__handle' />
        {children}
      </View>
    </View>
  )
}