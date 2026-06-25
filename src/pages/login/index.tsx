import { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro, { type BaseEventOrig, type ButtonProps } from '@tarojs/taro'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { triggerSync } from '@/services/sync'
import './index.scss'

export default function Login() {
  const { bindPhone, login } = useAuth()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(false)

  const handleGetPhoneNumber = async (
    event: BaseEventOrig<ButtonProps.onGetPhoneNumberEventDetail>,
  ) => {
    if (event.detail.errMsg !== 'getPhoneNumber:ok') {
      Taro.showToast({ title: '授权已取消', icon: 'none' })
      return
    }

    const { code } = event.detail
    if (!code) {
      Taro.showToast({ title: '获取手机号失败', icon: 'none' })
      return
    }

    setLoading(true)
    try {
      await login()
      await bindPhone(code)
      await triggerSync()
      Taro.showToast({ title: '绑定成功', icon: 'success' })
      setTimeout(() => {
        Taro.reLaunch({ url: '/pages/index/index' })
      }, 500)
    } catch (err) {
      const message = err instanceof Error ? err.message : '绑定失败'
      Taro.showToast({ title: message, icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='login' style={{ backgroundColor: theme.pageBg }}>
      <View className='login__hero'>
        <Text className='login__title' style={{ color: theme.textPrimary }}>
          欢迎使用简记
        </Text>
        <Text className='login__subtitle' style={{ color: theme.textSecondary }}>
          微信授权登录后，绑定手机号即可开始记账。你的数据将安全保存在云端，并在离线时自动同步。
        </Text>
      </View>

      <View className='login__actions'>
        <Button
          className='login__phone-btn'
          openType='getPhoneNumber'
          loading={loading}
          disabled={loading}
          style={{ background: theme.btnGradient, color: '#fff' }}
          onGetPhoneNumber={handleGetPhoneNumber}
        >
          微信授权并绑定手机号
        </Button>
        <Text className='login__hint' style={{ color: theme.textSecondary }}>
          点击按钮即表示同意获取你的微信手机号，用于账号识别与数据同步
        </Text>
      </View>
    </View>
  )
}
