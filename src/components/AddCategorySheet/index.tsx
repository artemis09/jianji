import { View, Text, Input, Button } from '@tarojs/components'
import { useEffect, useMemo, useState } from 'react'
import Taro from '@tarojs/taro'
import IceSheet from '@/components/IceSheet'
import CategoryIcon from '@/components/CategoryIcon'
import {
  EXPENSE_ICON_OPTIONS,
  INCOME_ICON_OPTIONS,
  ICON_OPTION_LABELS,
  type CategoryIconKey,
} from '@/constants/category-icons'
import { addCategory, hasCategoryName } from '@/services/categories'
import { useAuth } from '@/contexts/AuthContext'
import type { RecordType } from '@/types'
import './index.scss'

interface AddCategorySheetProps {
  visible: boolean
  type: RecordType
  onClose: () => void
  onSaved: () => void
}

export default function AddCategorySheet({ visible, type, onClose, onSaved }: AddCategorySheetProps) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [icon, setIcon] = useState<CategoryIconKey>('dining')

  const iconOptions = useMemo(
    () => (type === 'expense' ? EXPENSE_ICON_OPTIONS : INCOME_ICON_OPTIONS),
    [type],
  )

  useEffect(() => {
    if (!visible) return
    const defaultIcon = iconOptions[0] || 'dining'
    setIcon(defaultIcon)
    setName(ICON_OPTION_LABELS[defaultIcon])
  }, [visible, iconOptions])

  const selectIcon = (key: CategoryIconKey) => {
    setIcon(key)
    setName(ICON_OPTION_LABELS[key])
  }

  const trimmed = name.trim()
  const duplicate = useMemo(
    () => !!trimmed && !!user?.openid && hasCategoryName(user.openid, type, trimmed),
    [trimmed, user?.openid, type],
  )

  const handleSubmit = () => {
    if (!trimmed) {
      Taro.showToast({ title: '请输入分类名称', icon: 'none' })
      return
    }
    if (!user?.openid) return
    if (duplicate) {
      Taro.showToast({ title: '分类名称已存在', icon: 'none' })
      return
    }

    const created = addCategory({
      userId: user.openid,
      name: trimmed,
      icon,
      type,
      sort: Date.now(),
      isDefault: false,
    })
    if (!created) {
      Taro.showToast({ title: '分类名称已存在', icon: 'none' })
      return
    }
    Taro.showToast({ title: '已添加', icon: 'success' })
    onSaved()
    onClose()
  }

  return (
    <IceSheet visible={visible} onClose={onClose}>
      <View className='add-category-sheet'>
        <Text className='add-category-sheet__title'>添加{type === 'expense' ? '支出' : '收入'}分类</Text>

        <Text className='add-category-sheet__label'>选择图标</Text>
        <View className='add-category-sheet__icons'>
          {iconOptions.map(key => (
            <View
              key={key}
              className={`add-category-sheet__icon-item pressable ${icon === key ? 'add-category-sheet__icon-item--active' : ''}`}
              onClick={() => selectIcon(key)}
            >
              <CategoryIcon iconKey={key} active={icon === key} size='sm' />
              <Text className='add-category-sheet__icon-label'>{ICON_OPTION_LABELS[key]}</Text>
            </View>
          ))}
        </View>

        <Text className='add-category-sheet__label'>分类名称</Text>
        <Input
          className={`input-field add-category-sheet__input${duplicate ? ' add-category-sheet__input--error' : ''}`}
          placeholder='可修改分类名称'
          value={name}
          maxlength={8}
          onInput={e => setName(e.detail.value)}
        />
        {duplicate && (
          <Text className='add-category-sheet__error'>该名称已存在，请换一个</Text>
        )}

        <Button
          className={`btn-primary add-category-sheet__submit${duplicate || !trimmed ? ' add-category-sheet__submit--disabled' : ''}`}
          disabled={duplicate || !trimmed}
          onClick={handleSubmit}
        >
          确认添加
        </Button>
      </View>
    </IceSheet>
  )
}
