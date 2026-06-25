import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { Category } from '@/types'
import './index.scss'

interface CategoryGridProps {
  categories: Category[]
  selectedId?: string
  onSelect: (id: string) => void
}

export default function CategoryGrid({ categories, selectedId, onSelect }: CategoryGridProps) {
  return (
    <View className='category-grid'>
      {categories.map(cat => (
        <View
          key={cat._id}
          className={`category-grid__item ${selectedId === cat._id ? 'category-grid__item--active' : ''}`}
          onClick={() => onSelect(cat._id)}
        >
          <Text className='category-grid__icon'>{cat.icon}</Text>
          <Text className='category-grid__name'>{cat.name}</Text>
        </View>
      ))}
      <View
        className='category-grid__item category-grid__item--add'
        onClick={() => Taro.navigateTo({ url: '/pages/categories/index' })}
      >
        <Text className='category-grid__icon'>+</Text>
        <Text className='category-grid__name'>管理</Text>
      </View>
    </View>
  )
}
