import { View, Text, Input, Picker, Button } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import PageHeader from '@/components/PageHeader'
import { useThemePageClass } from '@/hooks/useThemePageClass'
import { useAuth } from '@/contexts/AuthContext'
import { getBudget, setBudget, removeBudget } from '@/services/budget'
import { formatAmount } from '@/utils/amount'
import './index.scss'

export default function BudgetPage() {
  const pageClass = useThemePageClass('page page-budget')
  const { user } = useAuth()
  const now = new Date()
  const currentMonth = now.toISOString().slice(0, 7)
  const [month, setMonth] = useState(currentMonth)
  const existing = getBudget(month)
  const [amount, setAmount] = useState(String(existing?.amount || ''))

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), i, 1)
    return d.toISOString().slice(0, 7)
  })

  const handleSave = () => {
    const val = parseFloat(amount)
    if (!val || val <= 0 || !user?.openid) {
      Taro.showToast({ title: '请输入有效金额', icon: 'none' })
      return
    }
    setBudget(month, val, user.openid)
    Taro.showToast({ title: '预算已保存', icon: 'success' })
    setTimeout(() => Taro.navigateBack(), 400)
  }

  const handleRemove = () => {
    removeBudget(month)
    setAmount('')
    Taro.showToast({ title: '预算已清除', icon: 'success' })
  }

  return (
    <View className={pageClass}>
      <PageHeader title='预算设置' left='back' />
      <View className='page__body'>
        <Picker
          mode='selector'
          range={monthOptions}
          value={monthOptions.indexOf(month)}
          onChange={e => {
            const m = monthOptions[Number(e.detail.value)]
            setMonth(m)
            const b = getBudget(m)
            setAmount(String(b?.amount || ''))
          }}
        >
          <View className='list-row pressable'>
            <Text>选择月份</Text>
            <Text>{month.replace('-', '年')}月</Text>
          </View>
        </Picker>

        <View className='budget-form'>
          <Text className='budget-form__label'>月度预算金额（元）</Text>
          <Input
            className='input-field'
            type='digit'
            placeholder='输入预算金额'
            value={amount}
            onInput={e => setAmount(e.detail.value)}
          />
          {existing && (
            <Text className='budget-form__hint'>当前预算：¥{formatAmount(existing.amount)}</Text>
          )}
          <Button className='btn-primary' onClick={handleSave}>保存</Button>
          {existing && (
            <Button className='budget-form__remove' onClick={handleRemove}>清除预算</Button>
          )}
        </View>
      </View>
    </View>
  )
}
