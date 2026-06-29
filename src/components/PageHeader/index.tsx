import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { ReactNode } from 'react'
import './index.scss'

type PageHeaderLeft = 'back' | 'cancel' | 'none'

interface PageHeaderProps {
  title: string
  left?: PageHeaderLeft
  onLeftClick?: () => void
  right?: ReactNode
}

export default function PageHeader({
  title,
  left = 'none',
  onLeftClick,
  right,
}: PageHeaderProps) {
  const handleLeft = () => {
    if (onLeftClick) {
      onLeftClick()
      return
    }
    if (left === 'back' || left === 'cancel') {
      Taro.navigateBack()
    }
  }

  const leftLabel = left === 'cancel' ? '取消' : left === 'back' ? '‹ 返回' : ''

  return (
    <View className='page-header'>
      <View
        className={`page-header__left ${left !== 'none' ? 'pressable' : ''}`}
        onClick={left !== 'none' ? handleLeft : undefined}
      >
        {leftLabel ? <Text>{leftLabel}</Text> : null}
      </View>
      <Text className='page-header__title'>{title}</Text>
      <View className='page-header__right'>{right}</View>
    </View>
  )
}
