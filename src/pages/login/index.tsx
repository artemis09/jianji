import { useState } from 'react'
import { View, Text, Button, Checkbox } from '@tarojs/components'
import Taro, { type BaseEventOrig, type ButtonProps } from '@tarojs/taro'
import { useAuth } from '@/contexts/AuthContext'
import { useThemePageClass } from '@/hooks/useThemePageClass'
import { isCloudFunctionNotFoundError, isCloudNotEnabledError } from '@/services/cloud'
import { storage } from '@/services/storage'
import { triggerFullSync } from '@/services/sync'
import { openWechatPrivacyContract } from '@/utils/wechat-privacy'
import './index.scss'

const AGREEMENT_URL = '/pages/agreement/index'
const PRIVACY_URL = '/pages/privacy/index'

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
  const [agreed, setAgreed] = useState(() => !!storage.getPrivacyAgreedAt())
  const hasPhone = !!storage.getUser()?.phone

  const openAgreement = (event?: { stopPropagation?: () => void }) => {
    event?.stopPropagation?.()
    Taro.navigateTo({ url: AGREEMENT_URL })
  }

  const openPrivacy = (event?: { stopPropagation?: () => void }) => {
    event?.stopPropagation?.()
    Taro.navigateTo({ url: PRIVACY_URL })
  }

  const handleAgreeChange = () => {
    const next = !agreed
    setAgreed(next)
    if (next) {
      storage.setPrivacyAgreedAt(Date.now())
    } else {
      storage.removePrivacyAgreedAt()
    }
  }

  const handleEnterApp = () => {
    Taro.reLaunch({ url: '/pages/index/index' })
  }

  const handleGetPhoneNumber = async (
    event: BaseEventOrig<ButtonProps.onGetPhoneNumberEventDetail>,
  ) => {
    if (!agreed) {
      Taro.showToast({ title: '请先阅读并同意相关协议', icon: 'none' })
      return
    }

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
      storage.setPrivacyAgreedAt(Date.now())
      await login()
      await bindPhone(code)
      try {
        await triggerFullSync()
      } catch (err) {
        console.warn('post-bind sync failed', err)
      }
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
          <View className='login__consent'>
            <Checkbox className='login__consent-check' value='agree' checked={agreed} onClick={handleAgreeChange} />
            <View className='login__consent-text'>
              <Text>我已阅读并同意</Text>
              <Text className='login__link' onClick={openAgreement}>《用户服务协议》</Text>
              <Text>和</Text>
              <Text className='login__link' onClick={openPrivacy}>《隐私政策》</Text>
              <Text>及</Text>
              <Text className='login__link' onClick={openWechatPrivacyContract}>《用户隐私保护指引》</Text>
              <Text>，并授权获取微信手机号用于账号识别与数据同步</Text>
            </View>
          </View>
          <Button
            className={`login__btn btn-primary${agreed ? '' : ' login__btn--disabled'}`}
            openType={agreed ? 'getPhoneNumber' : undefined}
            loading={loading}
            disabled={loading || !agreed}
            onGetPhoneNumber={handleGetPhoneNumber}
            onClick={() => {
              if (!agreed) {
                Taro.showToast({ title: '请先阅读并同意相关协议', icon: 'none' })
              }
            }}
          >
            微信授权并绑定手机号
          </Button>
        </View>
      </View>
    </View>
  )
}
