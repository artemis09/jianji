import { View, Text, Picker } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro, { useLoad, useRouter } from '@tarojs/taro'
import CategoryGrid from '@/components/CategoryGrid'
import NumPad from '@/components/NumPad'
import { addRecord, getRecords, updateRecord } from '@/services/records'
import { getCategories } from '@/services/categories'
import { useAuth } from '@/contexts/AuthContext'
import { currentDateStr } from '@/utils/date'
import { formatAmount } from '@/utils/amount'
import type { RecordType } from '@/types'
import './index.scss'

export default function AddPage() {
  const router = useRouter()
  const { user } = useAuth()
  const editId = router.params.id

  const [type, setType] = useState<RecordType>('expense')
  const [amountStr, setAmountStr] = useState('0')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(currentDateStr())
  const [categories, setCategories] = useState(() => getCategories())

  useLoad(() => {
    const cats = getCategories().filter(c => c.type === type)
    setCategories(getCategories())
    if (editId) {
      const record = getRecords().find(r => r._id === editId)
      if (record) {
        setType(record.type)
        setAmountStr(String(record.amount))
        setCategoryId(record.categoryId)
        setDate(record.date)
      }
    } else if (cats[0]) {
      setCategoryId(cats[0]._id)
    }
  })

  const filteredCategories = useMemo(
    () => categories.filter(c => c.type === type && c.userId === (user?.openid || '')),
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
      note: '',
      date,
    }
    if (editId) {
      updateRecord(editId, payload)
    } else {
      addRecord(payload)
    }
    if (network.networkType === 'none') {
      Taro.showToast({ title: '已保存，待同步', icon: 'none' })
    }
    Taro.navigateBack()
  }

  const onTypeChange = (next: RecordType) => {
    setType(next)
    const cats = getCategories().filter(c => c.type === next && c.userId === user?.openid)
    setCategoryId(cats[0]?._id || '')
  }

  return (
    <View className='page-add'>
      <View className='page-add__toggle'>
        <Text
          className={`page-add__tab ${type === 'expense' ? 'page-add__tab--active' : ''}`}
          onClick={() => onTypeChange('expense')}
        >
          支出
        </Text>
        <Text
          className={`page-add__tab ${type === 'income' ? 'page-add__tab--active' : ''}`}
          onClick={() => onTypeChange('income')}
        >
          收入
        </Text>
      </View>

      <Text className='page-add__amount'>{formatAmount(amount)}</Text>

      <CategoryGrid
        categories={filteredCategories}
        selectedId={categoryId}
        onSelect={setCategoryId}
      />

      <NumPad onInput={handleKey} />

      <View className='page-add__footer'>
        <Picker mode='date' value={date} onChange={e => setDate(e.detail.value)}>
          <View className='page-add__date'>📅 {date.slice(8, 10)}</View>
        </Picker>
        <View
          className={`page-add__done ${canSubmit ? '' : 'page-add__done--disabled'}`}
          onClick={handleSubmit}
        >
          <Text>完成</Text>
        </View>
      </View>
    </View>
  )
}
