import { View, Text } from '@tarojs/components'
import type { LegalSection } from '@/constants/legal'
import { APP_LEGAL_NAME, LEGAL_CONTACT, LEGAL_OPERATOR } from '@/constants/legal'
import './index.scss'

interface LegalDocumentProps {
  title: string
  updatedAt: string
  sections: LegalSection[]
}

export default function LegalDocument({ title, updatedAt, sections }: LegalDocumentProps) {
  return (
    <View className='legal-doc'>
      <Text className='legal-doc__title'>{title}</Text>
      <Text className='legal-doc__meta'>应用名称：{APP_LEGAL_NAME}</Text>
      <Text className='legal-doc__meta'>运营主体：{LEGAL_OPERATOR}</Text>
      <Text className='legal-doc__meta'>联系方式：{LEGAL_CONTACT}</Text>
      <Text className='legal-doc__meta'>更新日期：{updatedAt}</Text>
      <Text className='legal-doc__meta'>生效日期：{updatedAt}</Text>

      {sections.map(section => (
        <View key={section.title} className='legal-doc__section'>
          <Text className='legal-doc__section-title'>{section.title}</Text>
          {section.paragraphs.map((paragraph, index) => (
            <Text key={`${section.title}-${index}`} className='legal-doc__paragraph'>
              {paragraph}
            </Text>
          ))}
        </View>
      ))}
    </View>
  )
}
