import { View, Text, Input, Button } from '@tarojs/components'
import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { getCategories, addCategory, deleteCategory } from '@/services/categories'
import { useAuth } from '@/contexts/AuthContext'
import type { RecordType, Category } from '@/types'
import './index.scss'

export default function CategoriesPage() {
  const { user } = useAuth()
  const [type, setType] = useState<RecordType>('expense')
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('📝')

  const refresh = () => setCategories(getCategories())

  useDidShow(refresh)

  const list = categories.filter(c => c.type === type && c.userId === user?.openid)

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

  return (
    <View className='page-categories'>
      <View className='page-categories__toggle'>
        <Text
          className={type === 'expense' ? 'page-categories__tab--active' : ''}
          onClick={() => setType('expense')}
        >
          支出
        </Text>
        <Text
          className={type === 'income' ? 'page-categories__tab--active' : ''}
          onClick={() => setType('income')}
        >
          收入
        </Text>
      </View>

      {list.map(cat => (
        <View key={cat._id} className='page-categories__item'>
          <Text>{cat.icon} {cat.name}</Text>
          {!cat.isDefault && (
            <Text className='page-categories__del' onClick={() => handleDelete(cat._id)}>删除</Text>
          )}
        </View>
      ))}

      <View className='page-categories__form'>
        <Input
          className='page-categories__input'
          placeholder='分类名称'
          value={name}
          onInput={e => setName(e.detail.value)}
        />
        <Input
          className='page-categories__input'
          placeholder='emoji 图标'
          value={icon}
          onInput={e => setIcon(e.detail.value)}
        />
        <Button className='page-categories__btn' onClick={handleAdd}>添加分类</Button>
      </View>
    </View>
  )
}
