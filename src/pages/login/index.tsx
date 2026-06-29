import { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro, { type BaseEventOrig, type ButtonProps } from '@tarojs/taro'
import { useAuth } from '@/contexts/AuthContext'
import { useThemePageClass } from '@/hooks/useThemePageClass'
import { isCloudFunctionNotFoundError, isCloudNotEnabledError } from '@/services/cloud'
import { storage } from '@/services/storage'
import { triggerSync } from '@/services/sync'
import './index.scss'

const FEATURES = [
  { label: '快速', desc: '3 秒记一笔' },
  { label: '同步', desc: '离线自动同步' },
  { label: '安全', desc: '数据云端保存' },
] as const

function showBindError(err: unknown): void {
  const message = err instanceof Error ? err.message : '绑定失败，请稍后重试'
  if (message.length > 20 || isCloudNotEnabledError(err) || isCloudFunctionNotFoundError(err)) {
    Taro.showModal({
      title: '绑定失败',
      content: message,
      showCancel: false,
    })
    return
  }
  Taro.showToast({ title: message, icon: 'none' })
}

export default function Login() {
  const { bindPhone, login } = useAuth()
  const pageClass = useThemePageClass('page login')
  const [loading, setLoading] = useState(false)
  const hasPhone = !!storage.getUser()?.phone

  const handleEnterApp = () => {
    Taro.reLaunch({ url: '/pages/index/index' })
  }

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
      showBindError(err)
    } finally {
      setLoading(false)
    }
  }

  if (hasPhone) {
    return (
      <View className={`${pageClass} auth-gate`}>
        <Text className='auth-gate__title'>已登录</Text>
        <Text className='auth-gate__desc'>点击下方按钮进入简记</Text>
        <Button className='auth-gate__btn' onClick={handleEnterApp}>
          进入简记
        </Button>
      </View>
    )
  }

  return (
    <View className={pageClass}>
      <View className='login__ambient login__ambient--top' />
      <View className='login__ambient login__ambient--bottom' />

      <View className='login__body'>
        <View className='login__content'>
          <View className='login__brand'>
            <View className='login__logo'>
              <Text className='login__logo-char'>记</Text>
            </View>
            <Text className='login__app-name'>简记</Text>
            <Text className='login__tagline'>夜里的一束暖光，轻轻记下每一笔</Text>
          </View>

          <View className='login__card surface-card'>
            <Text className='login__card-title'>开始记账之旅</Text>
            <Text className='login__card-desc'>
              微信授权后绑定手机号，即可在多设备间同步你的账本数据
            </Text>

            <View className='login__features'>
              {FEATURES.map(item => (
                <View key={item.label} className='login__feature'>
                  <View className='login__feature-badge'>
                    <Text>{item.label}</Text>
                  </View>
                  <Text className='login__feature-label'>{item.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className='login__footer'>
          <Button
            className='login__btn btn-primary'
            openType='getPhoneNumber'
            loading={loading}
            disabled={loading}
            onGetPhoneNumber={handleGetPhoneNumber}
          >
            微信授权并绑定手机号
          </Button>
          <Text className='login__privacy'>
            点击按钮即表示同意获取微信手机号，用于账号识别与数据同步
          </Text>
        </View>
      </View>
    </View>
  )
}
