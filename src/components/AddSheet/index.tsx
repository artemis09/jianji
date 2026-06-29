import { View, Text, ScrollView } from '@tarojs/components'
import ThemedDatePicker from '@/components/ThemedDatePicker'
import { useState, useMemo, useEffect, useRef } from 'react'
import Taro from '@tarojs/taro'
import RecordTypeTabs from '@/components/RecordTypeTabs'
import CategoryGrid from '@/components/CategoryGrid'
import AddFormNote from '@/components/AddFormNote'
import NumPad from '@/components/NumPad'
import IceSheet from '@/components/IceSheet'
import { useAuth } from '@/contexts/AuthContext'
import { addRecord } from '@/services/records'
import { getSortedCategories } from '@/services/categories'
import { currentDateStr } from '@/utils/date'
import { formatAmount } from '@/utils/amount'
import type { RecordType, Category } from '@/types'
import './index.scss'

interface AddSheetProps {
  visible: boolean
  categories: Category[]
  onClose: () => void
  onSaved: () => void
}

export default function AddSheet({ visible, categories, onClose, onSaved }: AddSheetProps) {
  const { user } = useAuth()
  const [type, setType] = useState<RecordType>('expense')
  const [amountStr, setAmountStr] = useState('0')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(currentDateStr())
  const [note, setNote] = useState('')

  const filteredCategories = useMemo(
    () => getSortedCategories(user?.openid || '', type, categories),
    [categories, type, user?.openid],
  )

  const amount = parseFloat(amountStr) || 0
  const canSubmit = amount > 0 && categoryId

  const wasVisible = useRef(false)

  useEffect(() => {
    if (visible && !wasVisible.current) {
      setType('expense')
      setAmountStr('0')
      setDate(currentDateStr())
      setNote('')
      const expenseCats = getSortedCategories(user?.openid || '', 'expense', categories)
      setCategoryId(expenseCats[0]?._id || '')
    }
    wasVisible.current = visible
  }, [visible, user?.openid, categories])

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
    const cats = getSortedCategories(user?.openid || '', next, categories)
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
      <View className='add-sheet add-form'>
        <RecordTypeTabs
          value={type}
          onChange={onTypeChange}
          onCancel={onClose}
        />

        <View className='add-form__categories-wrap'>
          <ScrollView scrollY className='add-form__categories' enhanced showScrollbar>
            <CategoryGrid
              categories={filteredCategories}
              selectedId={categoryId}
              onSelect={setCategoryId}
              showManage={false}
            />
          </ScrollView>
          <View className='add-form__categories-fade' />
        </View>

        <View className='add-form__panel'>
          <View className='add-form__amount-wrap'>
            <Text className='add-form__currency'>¥</Text>
            <Text className='add-form__amount'>{formatAmount(amount)}</Text>
          </View>

          <AddFormNote value={note} onChange={setNote} />

          <NumPad onInput={handleKey} />

          <View className='add-form__footer'>
            <ThemedDatePicker value={date} onChange={setDate}>
              <View className='add-form__date pressable'>
                <Text className='add-form__date-label'>日期</Text>
                <Text className='add-form__date-value'>{date.replace(/-/g, '.')}</Text>
              </View>
            </ThemedDatePicker>
            <View
              className={`add-form__done pressable ${canSubmit ? '' : 'add-form__done--disabled'}`}
              onClick={handleSubmit}
            >
              <Text>完成</Text>
            </View>
          </View>
        </View>
      </View>
    </IceSheet>
  )
}
