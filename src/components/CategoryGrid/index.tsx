import { View, Text } from '@tarojs/components'
import { useState, useRef, useCallback, useEffect } from 'react'
import Taro from '@tarojs/taro'
import CategoryIcon from '@/components/CategoryIcon'
import { resolveCategoryIconKey } from '@/constants/category-icons'
import './index.scss'

interface CategoryItem {
  _id: string
  name: string
  icon: string
  type: 'expense' | 'income'
  sort?: number
  isDefault?: boolean
}

interface CategoryGridProps {
  categories: CategoryItem[]
  selectedId?: string
  onSelect: (id: string) => void
  onReorder?: (orderedIds: string[]) => void
  showManage?: boolean
  manageMode?: boolean
  onAdd?: () => void
  onDelete?: (id: string) => void
}

const GRID_COLS = 4
const LONG_PRESS_MS = 500

export default function CategoryGrid({
  categories,
  selectedId,
  onSelect,
  onReorder,
  showManage = true,
  manageMode = false,
  onAdd,
  onDelete,
}: CategoryGridProps) {
  const [ordered, setOrdered] = useState<CategoryItem[]>(() => categories)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const gridRef = useRef<{ left: number; top: number; itemW: number; itemH: number; gap: number } | null>(null)

  useEffect(() => {
    if (dragIndex === null) {
      setOrdered(categories)
    }
  }, [categories, dragIndex])

  const startDrag = useCallback((index: number, pageX: number, pageY: number) => {
    const query = Taro.createSelectorQuery()
    query.select('.category-grid').boundingClientRect()
    query.selectAll('.category-grid__item').boundingClientRect()
    query.exec((res) => {
      const gridRect = res[0]
      const items = res[1]
      if (!gridRect || !items?.[0]) return

      const itemW = items[0].width
      const itemH = items[0].height
      const gap = items.length > 1 ? items[1].left - items[0].left - itemW : 12

      gridRef.current = {
        left: gridRect.left,
        top: gridRect.top,
        itemW,
        itemH,
        gap,
      }

      setDragIndex(index)
      setDragPos({ x: pageX - itemW / 2, y: pageY - itemH / 2 })
    })
  }, [])

  const handleTouchStart = (index: number, e: any) => {
    if (!onReorder) return
    const touch = e.touches[0]
    longPressTimer.current = setTimeout(() => {
      startDrag(index, touch.pageX, touch.pageY)
    }, LONG_PRESS_MS)
  }

  const handleTouchMove = (e: any) => {
    if (dragIndex === null || !gridRef.current) return

    const touch = e.touches[0]
    const { left, top, itemW, itemH } = gridRef.current
    const colW = itemW + gridRef.current.gap
    const rowH = itemH + gridRef.current.gap

    setDragPos({ x: touch.pageX - itemW / 2, y: touch.pageY - itemH / 2 })

    const relativeX = touch.pageX - left
    const relativeY = touch.pageY - top
    const col = Math.max(0, Math.min(GRID_COLS - 1, Math.floor(relativeX / colW)))
    const row = Math.floor(relativeY / rowH)
    const targetIndex = row * GRID_COLS + col

    if (targetIndex >= 0 && targetIndex < ordered.length && targetIndex !== dragOverIndex) {
      setDragOverIndex(targetIndex)
      const newOrder = [...ordered]
      const [moved] = newOrder.splice(dragIndex, 1)
      newOrder.splice(targetIndex, 0, moved)
      setOrdered(newOrder)
      setDragIndex(targetIndex)
    }
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }

    if (dragIndex !== null && onReorder) {
      onReorder(ordered.map(c => c._id))
    }

    setDragIndex(null)
    setDragOverIndex(null)
    gridRef.current = null
  }

  const confirmDelete = useCallback((cat: CategoryItem) => {
    if (!onDelete) return
    Taro.showModal({
      title: '删除分类',
      content: `确定删除「${cat.name}」吗？`,
      success: res => {
        if (res.confirm) onDelete(cat._id)
      },
    })
  }, [onDelete])

  const handleItemClick = (cat: CategoryItem) => {
    if (dragIndex !== null) return
    if (manageMode && !cat.isDefault && onDelete) {
      confirmDelete(cat)
      return
    }
    if (manageMode && cat.isDefault) {
      Taro.showToast({ title: '预设分类不可删', icon: 'none' })
      return
    }
    onSelect(cat._id)
  }

  const reorderEnabled = !!onReorder

  return (
    <View
      className='category-grid'
      {...(reorderEnabled
        ? { onTouchMove: handleTouchMove, onTouchEnd: handleTouchEnd, catchMove: true }
        : {})}
    >
      {ordered.map((cat, i) => {
        const iconKey = resolveCategoryIconKey(cat.name, cat.icon)
        const active = selectedId === cat._id
        const isDragging = dragIndex === i

        return (
          <View
            key={cat._id}
            className={`category-grid__item pressable ${active ? 'category-grid__item--active' : ''} ${isDragging ? 'category-grid__item--dragging' : ''}`}
            style={isDragging ? {
              left: `${dragPos.x}px`,
              top: `${dragPos.y}px`,
              opacity: 0.85,
              zIndex: 10,
              transform: 'scale(1.05)',
              position: 'fixed',
            } : undefined}
            onClick={() => handleItemClick(cat)}
            {...(reorderEnabled
              ? {
                  onTouchStart: (e: any) => handleTouchStart(i, e),
                  onTouchEnd: handleTouchEnd,
                  onLongPress: () => {},
                }
              : {})}
          >
            <View className='category-grid__icon-wrap'>
              {isDragging && <View className='category-grid__drag-badge'>↕</View>}
              {manageMode && !cat.isDefault && onDelete && (
                <View
                  className='category-grid__del pressable'
                  catchTap={() => confirmDelete(cat)}
                >
                  ×
                </View>
              )}
              <CategoryIcon iconKey={iconKey} active={active} />
            </View>
            <Text className='category-grid__name'>{cat.name}</Text>
          </View>
        )
      })}
      {showManage && (
        <View
          className='category-grid__item category-grid__item--manage pressable'
          onClick={() => {
            if (onAdd) {
              onAdd()
              return
            }
            Taro.navigateTo({ url: '/pages/categories/index' })
          }}
        >
          <View className='category-grid__icon-wrap category-grid__icon-wrap--manage'>
            <CategoryIcon iconKey='manage' tinted={false} />
          </View>
          <Text className='category-grid__name'>{manageMode ? '添加' : '设置'}</Text>
        </View>
      )}
    </View>
  )
}
