import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getCategoryColor } from '@/constants/category-colors'
import './index.scss'

interface CategoryGridProps {
  categories: Array<{ _id: string; name: string; icon: string; type: 'expense' | 'income' }>
  selectedId?: string
  onSelect: (id: string) => void
}

export default function CategoryGrid({ categories, selectedId, onSelect }: CategoryGridProps) {
  return (
    <View className='category-grid'>
      {categories.map(cat => {
        const color = getCategoryColor(cat.name, cat.type)
        const active = selectedId === cat._id
        return (
          <View
            key={cat._id}
            className={`category-grid__item pressable ${active ? 'category-grid__item--active' : ''}`}
            style={active ? { borderColor: color, backgroundColor: `${color}14` } : undefined}
            onClick={() => onSelect(cat._id)}
          >
            <View className='category-grid__icon-wrap' style={{ backgroundColor: `${color}22` }}>
              <Text className='category-grid__icon' style={{ color }}>{cat.icon || cat.name.slice(0, 1)}</Text>
            </View>
            <Text className='category-grid__name' style={active ? { color } : undefined}>{cat.name}</Text>
          </View>
        )
      })}
      <View
        className='category-grid__item category-grid__item--manage pressable'
        onClick={() => Taro.navigateTo({ url: '/pages/categories/index' })}
      >
        <View className='category-grid__icon-wrap category-grid__icon-wrap--manage'>
          <Text className='category-grid__icon'>+</Text>
        </View>
        <Text className='category-grid__name'>管理</Text>
      </View>
    </View>
  )
}
