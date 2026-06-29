import { View, ScrollView } from '@tarojs/components'
import PageHeader from '@/components/PageHeader'
import LegalDocument from '@/components/LegalDocument'
import { useThemePageClass } from '@/hooks/useThemePageClass'
import { USER_AGREEMENT, LEGAL_UPDATED_AT } from '@/constants/legal'
import './index.scss'

export default function AgreementPage() {
  const pageClass = useThemePageClass('page page-legal')

  return (
    <View className={pageClass}>
      <PageHeader title='用户服务协议' left='back' />
      <ScrollView scrollY className='page-legal__scroll' enhanced showScrollbar>
        <LegalDocument
          title='用户服务协议'
          updatedAt={LEGAL_UPDATED_AT}
          sections={USER_AGREEMENT}
        />
      </ScrollView>
    </View>
  )
}
