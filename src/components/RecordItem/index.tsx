import { View, Text } from '@tarojs/components'
import { useRef, useState } from 'react'
import Taro from '@tarojs/taro'
import type { Record, Category } from '@/types'
import { getCategoryColor } from '@/constants/category-colors'
import { formatAmount } from '@/utils/amount'
import './index.scss'

interface RecordItemProps {
  record: Record
  category?: Category
  onDelete: (id: string) => void
  onEdit: (id: string) => void
}

let activeSwipeId: string | null = null
const swipeCallbacks = new Map<string, () => void>()

export function resetAllSwipes() {
  swipeCallbacks.forEach(cb => cb())
}

export default function RecordItem({ record, category, onDelete, onEdit }: RecordItemProps) {
  const isExpense = record.type === 'expense'
  const sign = isExpense ? '-' : '+'
  const catName = category?.name || '未分类'
  const catColor = getCategoryColor(catName, record.type)
  const displayName = record.note || catName
  const timeStr = record.createdAt ? record.createdAt.slice(11, 16) : ''
  const [translateX, setTranslateX] = useState(0)
  const startX = useRef(0)
  const id = record._id

  // Register/deregister global reset callback
  useState(() => {
    swipeCallbacks.set(id, () => setTranslateX(0))
    return () => { swipeCallbacks.delete(id) }
  })

  const handleTouchStart = (e: any) => {
    startX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: any) => {
    const diff = startX.current - e.touches[0].clientX
    if (diff > 0) {
      // Reset other active swipe
      if (activeSwipeId && activeSwipeId !== id) {
        swipeCallbacks.get(activeSwipeId)?.()
      }
      activeSwipeId = id
      setTranslateX(Math.min(diff, 160))
    } else if (translateX > 0) {
      setTranslateX(Math.max(0, translateX + diff))
    }
  }

  const handleTouchEnd = () => {
    if (translateX > 80) {
      setTranslateX(160) // Snap open
    } else {
      setTranslateX(0)   // Snap closed
      if (activeSwipeId === id) activeSwipeId = null
    }
  }

  const handleDelete = () => {
    Taro.showModal({
      title: '删除记录',
      content: '确定删除这条记录吗？',
      success: res => {
        if (res.confirm) {
          onDelete(record._id)
          activeSwipeId = null
        } else {
          setTranslateX(0)
        }
      },
    })
  }

  return (
    <View className='record-item-wrap'>
      <View
        className='record-item pressable'
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => { if (translateX === 0) onEdit(record._id) }}
        onLongPress={() => {
          Taro.showModal({
            title: '删除记录',
            content: '确定删除这条记录吗？',
            success: res => { if (res.confirm) onDelete(record._id) },
          })
        }}
      >
        <View className='record-item__color-bar' style={{ backgroundColor: catColor }} />
        <View className='record-item__icon' style={{ backgroundColor: `${catColor}22`, borderColor: `${catColor}44` }}>
          <Text className='record-item__icon-text' style={{ color: catColor }}>
            {category?.icon || catName.slice(0, 1)}
          </Text>
        </View>
        <View className='record-item__body'>
          <Text className='record-item__title'>{displayName}</Text>
          <View className='record-item__meta'>
            <Text className='record-item__badge'>{catName}</Text>
            {timeStr && <Text className='record-item__time'>{timeStr}</Text>}
          </View>
        </View>
        <Text className={`record-item__amount ${isExpense ? 'record-item__amount--expense' : 'record-item__amount--income'}`}>
          {sign}{formatAmount(record.amount)}
        </Text>
      </View>
      <View className='record-item__delete-btn' onClick={handleDelete}>
        <Text>删除</Text>
      </View>
    </View>
  )
}
