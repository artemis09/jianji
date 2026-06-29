import { View, Text, Picker, Input, Textarea } from '@tarojs/components'
import { useState, useMemo, useEffect } from 'react'
import Taro from '@tarojs/taro'
import CategoryGrid from '@/components/CategoryGrid'
import NumPad from '@/components/NumPad'
import IceSheet from '@/components/IceSheet'
import { useAuth } from '@/contexts/AuthContext'
import { addRecord } from '@/services/records'
import { getCategories } from '@/services/categories'
import { currentDateStr } from '@/utils/date'
import { formatAmount } from '@/utils/amount'
import type { RecordType } from '@/types'
import './index.scss'

interface AddSheetProps {
  visible: boolean
  onClose: () => void
  onSaved: () => void
}

export default function AddSheet({ visible, onClose, onSaved }: AddSheetProps) {
  const { user } = useAuth()
  const [type, setType] = useState<RecordType>('expense')
  const [amountStr, setAmountStr] = useState('0')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(currentDateStr())
  const [note, setNote] = useState('')
  const [noteExpanded, setNoteExpanded] = useState(false)
  const [categories, setCategories] = useState(() => getCategories())

  const filteredCategories = useMemo(
    () => categories.filter(c => c.type === type && c.userId === (user?.openid || '')),
    [categories, type, user?.openid],
  )

  const amount = parseFloat(amountStr) || 0
  const canSubmit = amount > 0 && categoryId

  // Reset state when opening
  useEffect(() => {
    if (visible) {
      setType('expense')
      setAmountStr('0')
      setDate(currentDateStr())
      setNote('')
      setNoteExpanded(false)
      const cats = getCategories()
      setCategories(cats)
      const expenseCats = cats.filter(c => c.type === 'expense' && c.userId === user?.openid)
      setCategoryId(expenseCats[0]?._id || '')
    }
  }, [visible, user?.openid])

  const handleKey = (key: string) => {
    if (key === 'del') {
      setAmountStr(prev => (prev.length <= 1 ? '0' : prev.slice(0, -1)))
      return
    }
    if (key === '.') {
      if (!amountStr.includes('.')) setAmountStr(prev => `${prev}.`)
      return
    }
    setAmountStr(prev => {
      if (prev === '0') return key
      if (prev.includes('.') && prev.split('.')[1]?.length >= 2) return prev
      return prev + key
    })
  }

  const onTypeChange = (next: RecordType) => {
    setType(next)
    const cats = getCategories().filter(c => c.type === next && c.userId === user?.openid)
    setCategoryId(cats[0]?._id || '')
  }

  const handleSubmit = async () => {
    if (!canSubmit || !user?.openid) return
    const network = await Taro.getNetworkType()
    addRecord({
      userId: user.openid,
      type,
      amount,
      categoryId,
      note,
      date,
    })
    Taro.showToast({ title: '记账成功', icon: 'success' })
    if (network.networkType === 'none') {
      setTimeout(() => {
        Taro.showToast({ title: '已保存，待同步', icon: 'none' })
      }, 1500)
    }
    onSaved()
    onClose()
  }

  return (
    <IceSheet visible={visible} onClose={onClose}>
      <View className='add-sheet'>
        <View className='add-sheet__toggle'>
          <Text
            className={`add-sheet__tab ${type === 'expense' ? 'add-sheet__tab--active add-sheet__tab--expense' : ''}`}
            onClick={() => onTypeChange('expense')}
          >
            支出
          </Text>
          <Text
            className={`add-sheet__tab ${type === 'income' ? 'add-sheet__tab--active add-sheet__tab--income' : ''}`}
            onClick={() => onTypeChange('income')}
          >
            收入
          </Text>
        </View>

        <View className='add-sheet__amount-wrap'>
          <Text className='add-sheet__currency'>¥</Text>
          <Text className='add-sheet__amount'>{formatAmount(amount)}</Text>
        </View>

        <Text className='add-sheet__hint'>选择分类</Text>

        <CategoryGrid
          categories={filteredCategories}
          selectedId={categoryId}
          onSelect={setCategoryId}
        />

        {/* 备注 — 展开式 */}
        <View className='add-sheet__note'>
          {noteExpanded || note ? (
            <Textarea
              className='add-sheet__note-input'
              placeholder='记录一下…'
              value={note}
              onInput={e => setNote(e.detail.value)}
              autoFocus
            />
          ) : (
            <View className='add-sheet__note-placeholder pressable' onClick={() => setNoteExpanded(true)}>
              <Text className='add-sheet__note-icon'>📝</Text>
              <Text>添加备注…</Text>
            </View>
          )}
        </View>

        <NumPad onInput={handleKey} />

        <View className='add-sheet__footer'>
          <Picker mode='date' value={date} onChange={e => setDate(e.detail.value)}>
            <View className='add-sheet__date'>
              <Text className='add-sheet__date-label'>日期</Text>
              <Text className='add-sheet__date-value'>{date.replace(/-/g, '.')}</Text>
            </View>
          </Picker>
          <View
            className={`add-sheet__done ${canSubmit ? '' : 'add-sheet__done--disabled'}`}
            onClick={handleSubmit}
          >
            <Text>完成</Text>
          </View>
        </View>
      </View>
    </IceSheet>
  )
}
