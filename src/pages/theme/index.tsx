import { View, Text } from '@tarojs/components'
import { useTheme } from '@/contexts/ThemeContext'
import { useThemePageClass } from '@/hooks/useThemePageClass'
import PageHeader from '@/components/PageHeader'
import ThemePreview from '@/components/ThemePreview'
import { THEME_META } from '@/themes/meta'
import type { ThemeId } from '@/types'
import './index.scss'

const THEME_IDS = Object.keys(THEME_META) as ThemeId[]

export default function ThemePage() {
  const pageClass = useThemePageClass('page page-theme')
  const { themeId, setTheme } = useTheme()

  return (
    <View className={pageClass}>
      <PageHeader title='外观主题' left='back' />
      <Text className='page__hint'>选择后立即生效</Text>
      <View className='page__body'>
        {THEME_IDS.map(id => {
          const meta = THEME_META[id]
          const active = themeId === id
          return (
            <View
              key={id}
              className={`page-theme__card pressable ${active ? 'page-theme__card--active' : ''}`}
              onClick={() => setTheme(id)}
            >
              <ThemePreview themeId={id} active={active} />
              <View className='page-theme__info'>
                <Text className='page-theme__name'>{meta.name}</Text>
                <Text className='page-theme__desc'>{meta.subtitle}</Text>
              </View>
              {active && <Text className='page-theme__check'>✓</Text>}
            </View>
          )
        })}
      </View>
    </View>
  )
}
