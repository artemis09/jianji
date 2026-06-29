import { View, Text, ScrollView } from '@tarojs/components'
import ThemedDatePicker from '@/components/ThemedDatePicker'
import { useState, useMemo, useCallback } from 'react'
import Taro, { useLoad, useRouter, useDidShow } from '@tarojs/taro'
import { useDataRefresh } from '@/hooks/useDataRefresh'
import RecordTypeTabs from '@/components/RecordTypeTabs'
import CategoryGrid from '@/components/CategoryGrid'
import AddFormNote from '@/components/AddFormNote'
import NumPad from '@/components/NumPad'
import { useThemePageClass } from '@/hooks/useThemePageClass'
import { addRecord, getRecords, updateRecord } from '@/services/records'
import { getCategories, getSortedCategories } from '@/services/categories'
import { useAuth } from '@/contexts/AuthContext'
import { currentDateStr } from '@/utils/date'
import { formatAmount } from '@/utils/amount'
import type { RecordType } from '@/types'
import './index.scss'

export default function AddPage() {
  const pageClass = useThemePageClass('page page-add')
  const router = useRouter()
  const { user } = useAuth()
  const editId = router.params.id

  const [type, setType] = useState<RecordType>('expense')
  const [amountStr, setAmountStr] = useState('0')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(currentDateStr())
  const [note, setNote] = useState('')
  const [categories, setCategories] = useState(() => getCategories())

  const refreshCategories = useCallback(() => setCategories(getCategories()), [])

  useDataRefresh(refreshCategories)
  useDidShow(refreshCategories)

  useLoad(() => {
    const cats = getCategories()
    setCategories(cats)
    if (editId) {
      const record = getRecords().find(r => r._id === editId)
      if (record) {
        setType(record.type)
        setAmountStr(String(record.amount))
        setCategoryId(record.categoryId)
        setDate(record.date)
        setNote(record.note || '')
      }
    } else {
      const sorted = getSortedCategories(user?.openid || '', type, cats)
      if (sorted[0]) setCategoryId(sorted[0]._id)
    }
  })

  const filteredCategories = useMemo(
    () => getSortedCategories(user?.openid || '', type, categories),
    [categories, type, user?.openid],
  )

  const amount = parseFloat(amountStr) || 0
  const canSubmit = amount > 0 && categoryId

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

  const handleSubmit = async () => {
    if (!canSubmit || !user?.openid) return
    const network = await Taro.getNetworkType()
    const payload = {
      userId: user.openid,
      type,
      amount,
      categoryId,
      note,
      date,
    }
    if (editId) {
      updateRecord(editId, payload)
      Taro.showToast({ title: '已更新', icon: 'success' })
    } else {
      addRecord(payload)
      Taro.showToast({ title: '记账成功', icon: 'success' })
    }
    if (network.networkType === 'none') {
      setTimeout(() => {
        Taro.showToast({ title: '已保存，待同步', icon: 'none' })
      }, 1500)
    }
    setTimeout(() => Taro.navigateBack(), 400)
  }

  const onTypeChange = (next: RecordType) => {
    setType(next)
    const cats = getSortedCategories(user?.openid || '', next, categories)
    setCategoryId(cats[0]?._id || '')
  }

  return (
    <View className={`${pageClass} add-form`}>
      <View className='page-add__brand-bar'>
        <Text className='page-add__brand'>简记</Text>
      </View>

      <RecordTypeTabs
        value={type}
        onChange={onTypeChange}
        onCancel={() => Taro.navigateBack()}
      />

      <View className='add-form__categories-wrap'>
        <ScrollView scrollY className='add-form__categories' enhanced showScrollbar>
          <CategoryGrid
            categories={filteredCategories}
            selectedId={categoryId}
            onSelect={setCategoryId}
            showManage
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
  )
}
