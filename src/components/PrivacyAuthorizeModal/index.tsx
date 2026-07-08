import { View, Text, Button } from '@tarojs/components'
import { useEffect, useRef, useState } from 'react'
import Taro from '@tarojs/taro'
import { PRIVACY_AUTH_EVENT, openWechatPrivacyContract } from '@/utils/wechat-privacy'
import './index.scss'

const AGREEMENT_URL = '/pages/agreement/index'
const PRIVACY_URL = '/pages/privacy/index'
const AGREE_BUTTON_ID = 'privacy-agree-btn'

type PrivacyResolve = (detail: { event: 'agree' | 'disagree'; buttonId?: string }) => void

export default function PrivacyAuthorizeModal() {
  const [visible, setVisible] = useState(false)
  const resolveRef = useRef<PrivacyResolve | null>(null)

  useEffect(() => {
    const handler = (resolve: PrivacyResolve) => {
      resolveRef.current = resolve
      setVisible(true)
    }
    Taro.eventCenter.on(PRIVACY_AUTH_EVENT, handler)
    return () => {
      Taro.eventCenter.off(PRIVACY_AUTH_EVENT, handler)
    }
  }, [])

  const close = () => {
    setVisible(false)
    resolveRef.current = null
  }

  const handleDisagree = () => {
    resolveRef.current?.({ event: 'disagree' })
    close()
  }

  const handleAgreePrivacyAuthorization = () => {
    resolveRef.current?.({ event: 'agree', buttonId: AGREE_BUTTON_ID })
    close()
  }

  const openAgreement = () => {
    Taro.navigateTo({ url: AGREEMENT_URL })
  }

  const openPrivacy = () => {
    Taro.navigateTo({ url: PRIVACY_URL })
  }

  if (!visible) return null

  return (
    <View className='privacy-auth-modal' catchMove>
      <View className='privacy-auth-modal__mask' />
      <View className='privacy-auth-modal__panel surface-card'>
        <Text className='privacy-auth-modal__title'>隐私保护提示</Text>
        <Text className='privacy-auth-modal__desc'>
          为保障您的个人信息安全，在使用手机号登录前，请阅读并同意
          <Text className='privacy-auth-modal__link' onClick={openAgreement}>《用户服务协议》</Text>
          、
          <Text className='privacy-auth-modal__link' onClick={openPrivacy}>《隐私政策》</Text>
          及
          <Text className='privacy-auth-modal__link' onClick={openWechatPrivacyContract}>《用户隐私保护指引》</Text>
          。我们将按照隐私政策收集、使用您的手机号，用于账号识别与数据同步。
        </Text>
        <View className='privacy-auth-modal__actions'>
          <Button className='privacy-auth-modal__btn privacy-auth-modal__btn--ghost' onClick={handleDisagree}>
            不同意
          </Button>
          <Button
            id={AGREE_BUTTON_ID}
            className='privacy-auth-modal__btn btn-primary'
            openType='agreePrivacyAuthorization'
            onAgreePrivacyAuthorization={handleAgreePrivacyAuthorization}
          >
            同意并继续
          </Button>
        </View>
      </View>
    </View>
  )
}
