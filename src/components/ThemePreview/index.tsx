import { View, Text } from '@tarojs/components'
import type { ThemeId } from '@/types'
import { THEME_META } from '@/themes/meta'
import './index.scss'

interface ThemePreviewProps {
  themeId: ThemeId
  active?: boolean
}

export default function ThemePreview({ themeId, active }: ThemePreviewProps) {
  const { preview } = THEME_META[themeId]

  return (
    <View
      className={`theme-preview ${active ? 'theme-preview--active' : ''}`}
      style={{ background: preview.bg }}
    >
      <View className='theme-preview__card' style={{ background: preview.surface }}>
        <View className='theme-preview__bar' style={{ background: preview.primary }} />
        <View className='theme-preview__row'>
          <View className='theme-preview__dot' style={{ background: preview.income }} />
          <View className='theme-preview__line' style={{ background: preview.surface, borderColor: preview.expense }} />
        </View>
        <View className='theme-preview__amount' style={{ color: preview.primary }}>¥</View>
      </View>
      <View className='theme-preview__fab' style={{ background: preview.primary }}>
        <Text className='theme-preview__fab-plus'>+</Text>
      </View>
    </View>
  )
}
