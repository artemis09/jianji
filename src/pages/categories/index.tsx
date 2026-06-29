import { View, Text, Input, Button } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import PageHeader from '@/components/PageHeader'
import SegToggle from '@/components/SegToggle'
import CategoryGrid from '@/components/CategoryGrid'
import { useThemePageClass } from '@/hooks/useThemePageClass'
import { getCategories, addCategory, deleteCategory, updateCategory } from '@/services/categories'
import { useAuth } from '@/contexts/AuthContext'
import type { RecordType, Category } from '@/types'
import './index.scss'

export default function CategoriesPage() {
  const pageClass = useThemePageClass('page page-categories')
  const { user } = useAuth()
  const [type, setType] = useState<RecordType>('expense')
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('📝')

  const refresh = () => setCategories(getCategories())

  useDidShow(refresh)

  const list = useMemo(
    () => {
      const filtered = categories.filter(c => c.type === type && c.userId === user?.openid)
      return filtered.sort((a, b) => a.sort - b.sort)
    },
    [categories, type, user?.openid],
  )

  const handleAdd = () => {
    if (!name.trim() || !user?.openid) return
    addCategory({
      userId: user.openid,
      name: name.trim(),
      icon,
      type,
      sort: list.length,
      isDefault: false,
    })
    setName('')
    refresh()
    Taro.showToast({ title: '已添加', icon: 'success' })
  }

  const handleDelete = (id: string) => {
    if (deleteCategory(id)) {
      refresh()
    } else {
      Taro.showToast({ title: '预设分类不可删', icon: 'none' })
    }
  }

  const handleReorder = (orderedIds: string[]) => {
    orderedIds.forEach((id, index) => {
      updateCategory(id, { sort: index })
    })
    refresh()
  }

  return (
    <View className={pageClass}>
      <PageHeader title='分类管理' left='back' />
      <SegToggle value={type} onChange={setType} />

      <View className='page__body'>
        <CategoryGrid
          categories={list}
          onSelect={() => {}}
          onReorder={handleReorder}
        />

        {list.map(cat => (
          <View key={cat._id} className='list-row'>
            <Text>{cat.icon} {cat.name}</Text>
            {!cat.isDefault && (
              <Text className='page-categories__del pressable' onClick={() => handleDelete(cat._id)}>
                删除
              </Text>
            )}
          </View>
        ))}

        <View className='page-categories__form'>
          <Input
            className='input-field'
            placeholder='分类名称'
            value={name}
            onInput={e => setName(e.detail.value)}
          />
          <Input
            className='input-field'
            placeholder='emoji 图标'
            value={icon}
            onInput={e => setIcon(e.detail.value)}
          />
          <Button className='btn-primary' onClick={handleAdd}>添加分类</Button>
        </View>
      </View>
    </View>
  )
}
