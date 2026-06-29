import { View, Text } from '@tarojs/components'
import { useRef, useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import CategoryIcon from '@/components/CategoryIcon'
import { resolveCategoryIconKey } from '@/constants/category-icons'
import { getCategoryColor } from '@/constants/category-colors'
import type { Record, Category } from '@/types'
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
  activeSwipeId = null
}

const SWIPE_OPEN = 160
const SWIPE_THRESHOLD = 72

export default function RecordItem({ record, category, onDelete, onEdit }: RecordItemProps) {
  const isExpense = record.type === 'expense'
  const sign = isExpense ? '-' : '+'
  const catName = category?.name || '未分类'
  const catColor = getCategoryColor(catName, record.type)
  const displayName = record.note || catName
  const timeStr = record.createdAt ? record.createdAt.slice(11, 16) : ''
  const [translateX, setTranslateX] = useState(0)
  const startX = useRef(0)
  const startY = useRef(0)
  const swiping = useRef(false)
  const id = record._id

  useEffect(() => {
    swipeCallbacks.set(id, () => setTranslateX(0))
    return () => {
      swipeCallbacks.delete(id)
      if (activeSwipeId === id) activeSwipeId = null
    }
  }, [id])

  const handleTouchStart = (e: any) => {
    const touch = e.touches[0]
    startX.current = touch.pageX
    startY.current = touch.pageY
    swiping.current = false
  }

  const handleTouchMove = (e: any) => {
    const touch = e.touches[0]
    const diffX = startX.current - touch.pageX
    const diffY = Math.abs(touch.pageY - startY.current)

    if (!swiping.current && diffX > 8 && diffX > diffY) {
      swiping.current = true
    }
    if (!swiping.current) return

    if (diffX > 0) {
      if (activeSwipeId && activeSwipeId !== id) {
        swipeCallbacks.get(activeSwipeId)?.()
      }
      activeSwipeId = id
      setTranslateX(Math.min(diffX, SWIPE_OPEN))
    } else if (translateX > 0) {
      const closeDelta = touch.pageX - startX.current
      setTranslateX(Math.max(0, translateX - closeDelta))
      startX.current = touch.pageX
    }
  }

  const handleTouchEnd = () => {
    if (!swiping.current && translateX === 0) return

    if (translateX > SWIPE_THRESHOLD) {
      setTranslateX(SWIPE_OPEN)
    } else {
      setTranslateX(0)
      if (activeSwipeId === id) activeSwipeId = null
    }
    swiping.current = false
  }

  const closeSwipe = () => {
    setTranslateX(0)
    if (activeSwipeId === id) activeSwipeId = null
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
          closeSwipe()
        }
      },
    })
  }

  const handleItemClick = () => {
    if (translateX > 0) {
      closeSwipe()
      return
    }
    onEdit(record._id)
  }

  return (
    <View className='record-item-wrap'>
      <View
        className='record-item pressable'
        style={{ transform: `translateX(-${translateX}px)` }}
        onTouchStart={handleTouchStart}
        catchTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleItemClick}
      >
        <View className='record-item__color-bar' style={{ backgroundColor: catColor }} />
        <View className='record-item__icon'>
          <CategoryIcon
            iconKey={resolveCategoryIconKey(catName, category?.icon)}
            size='sm'
          />
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
      <View className='record-item__delete-btn' catchTap={handleDelete}>
        <Text>删除</Text>
      </View>
    </View>
  )
}
