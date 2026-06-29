import { View, Text } from '@tarojs/components'
import { useState, useMemo, useCallback } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { useDataRefresh } from '@/hooks/useDataRefresh'
import PageHeader from '@/components/PageHeader'
import SegToggle from '@/components/SegToggle'
import CategoryGrid from '@/components/CategoryGrid'
import AddCategorySheet from '@/components/AddCategorySheet'
import { useThemePageClass } from '@/hooks/useThemePageClass'
import { getCategories, deleteCategory, reorderCategories, getSortedCategories } from '@/services/categories'
import { useAuth } from '@/contexts/AuthContext'
import type { RecordType, Category } from '@/types'
import './index.scss'

export default function CategoriesPage() {
  const pageClass = useThemePageClass('page page-categories')
  const { user } = useAuth()
  const [type, setType] = useState<RecordType>('expense')
  const [categories, setCategories] = useState<Category[]>([])
  const [sheetVisible, setSheetVisible] = useState(false)

  const refresh = useCallback(() => setCategories(getCategories()), [])

  useDataRefresh(refresh)

  useDidShow(refresh)

  const list = useMemo(
    () => getSortedCategories(user?.openid || '', type, categories),
    [categories, type, user?.openid],
  )

  const handleDelete = (id: string) => {
    if (deleteCategory(id)) {
      refresh()
      Taro.showToast({ title: '已删除', icon: 'success' })
    } else {
      Taro.showToast({ title: '预设分类不可删', icon: 'none' })
    }
  }

  const handleReorder = (orderedIds: string[]) => {
    if (!user?.openid) return
    reorderCategories(user.openid, type, orderedIds)
    refresh()
  }

  return (
    <View className={pageClass}>
      <PageHeader title='分类管理' left='back' />
      <SegToggle value={type} onChange={setType} />

      <View className='page__body page-categories__body'>
        <CategoryGrid
          categories={list}
          onSelect={() => {}}
          onReorder={handleReorder}
          manageMode
          onAdd={() => setSheetVisible(true)}
          onDelete={handleDelete}
        />
        <Text className='page-categories__hint'>点击自定义分类可删除 · 长按拖动调整顺序</Text>
      </View>

      <AddCategorySheet
        visible={sheetVisible}
        type={type}
        onClose={() => setSheetVisible(false)}
        onSaved={refresh}
      />
    </View>
  )
}
