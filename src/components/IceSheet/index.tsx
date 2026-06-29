import { View } from '@tarojs/components'
import { useEffect, useRef, useState } from 'react'
import type { PropsWithChildren } from 'react'
import './index.scss'

interface IceSheetProps {
  visible: boolean
  onClose: () => void
}

export default function IceSheet({ visible, onClose, children }: PropsWithChildren<IceSheetProps>) {
  const [animState, setAnimState] = useState<'idle' | 'enter' | 'exit' | 'hidden'>('hidden')
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (visible) {
      // Step 1: render DOM nodes at off-screen position (translateY(100%))
      setAnimState('idle')
      // Step 2: next frame, apply --enter class to trigger transition
      rafRef.current = requestAnimationFrame(() => {
        setAnimState('enter')
      })
    } else if (animState === 'enter' || animState === 'idle') {
      setAnimState('exit')
      const timer = setTimeout(() => setAnimState('hidden'), 300)
      return () => clearTimeout(timer)
    }
    return () => cancelAnimationFrame(rafRef.current)
  }, [visible])

  if (animState === 'hidden') return null

  const isEnter = animState === 'enter'
  const sheetClass = `ice-sheet ${isEnter ? 'ice-sheet--enter' : ''} ${animState === 'exit' ? 'ice-sheet--exit' : ''}`
  const maskClass = `ice-sheet__mask ${isEnter ? 'ice-sheet__mask--enter' : ''} ${animState === 'exit' ? 'ice-sheet__mask--exit' : ''}`

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
