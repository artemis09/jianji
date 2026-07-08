import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'
import './index.scss'

const AGREEMENT_URL = '/pages/agreement/index'
const PRIVACY_URL = '/pages/privacy/index'

interface LegalLinksProps {
  className?: string
  prefix?: string
  suffix?: string
}

export default function LegalLinks({
  className = '',
  prefix = '登录即表示您已阅读并同意',
  suffix = '',
}: LegalLinksProps) {
  const openAgreement = () => {
    Taro.navigateTo({ url: AGREEMENT_URL })
  }

  const openPrivacy = () => {
    Taro.navigateTo({ url: PRIVACY_URL })
  }

  return (
    <View className={`legal-links ${className}`.trim()}>
      <Text className='legal-links__text'>
        {prefix}
        <Text className='legal-links__link' onClick={openAgreement}>《用户服务协议》</Text>
        和
        <Text className='legal-links__link' onClick={openPrivacy}>《隐私政策》</Text>
        {suffix}
      </Text>
    </View>
  )
}
