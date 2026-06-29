import { View, ScrollView } from '@tarojs/components'
import PageHeader from '@/components/PageHeader'
import LegalDocument from '@/components/LegalDocument'
import { useThemePageClass } from '@/hooks/useThemePageClass'
import { PRIVACY_POLICY, LEGAL_UPDATED_AT } from '@/constants/legal'
import './index.scss'

export default function PrivacyPage() {
  const pageClass = useThemePageClass('page page-legal')

  return (
    <View className={pageClass}>
      <PageHeader title='隐私政策' left='back' />
      <ScrollView scrollY className='page-legal__scroll' enhanced showScrollbar>
        <LegalDocument
          title='隐私政策'
          updatedAt={LEGAL_UPDATED_AT}
          sections={PRIVACY_POLICY}
        />
      </ScrollView>
    </View>
  )
}
