import { View, Text } from '@tarojs/components'
import { useTheme } from '@/contexts/ThemeContext'
import { useThemePageClass } from '@/hooks/useThemePageClass'
import PageHeader from '@/components/PageHeader'
import { THEMES } from '@/themes/tokens'
import type { ThemeId } from '@/types'
import './index.scss'

const THEME_META: Record<ThemeId, { name: string; desc: string }> = {
  warm: { name: '暖阳简约', desc: '暗夜暖阳 · 暖黄发光' },
  mint: { name: '薄荷清新', desc: '翠绿渐变 · 清爽治愈' },
  dark: { name: '墨夜金奢', desc: '暗色 · 香槟金' },
  candy: { name: '缤纷糖果', desc: '马卡龙多色' },
  caramel: { name: '焦糖暖调', desc: '奶油质感 · 全暖色' },
}

export default function ThemePage() {
  const pageClass = useThemePageClass('page page-theme')
  const { themeId, setTheme } = useTheme()
  const ids = Object.keys(THEMES) as ThemeId[]

  return (
    <View className={pageClass}>
      <PageHeader title='外观主题' left='back' />
      <Text className='page__hint'>选择后立即生效</Text>
      <View className='page__body'>
        {ids.map(id => (
          <View
            key={id}
            className={`page-theme__card pressable ${themeId === id ? 'page-theme__card--active' : ''}`}
            onClick={() => setTheme(id)}
          >
            <View className='page-theme__preview' style={{ background: THEMES[id].primaryGradient }} />
            <View className='page-theme__info'>
              <Text className='page-theme__name'>{THEME_META[id].name}</Text>
              <Text className='page-theme__desc'>{THEME_META[id].desc}</Text>
            </View>
            {themeId === id && <Text className='page-theme__check'>✓</Text>}
          </View>
        ))}
      </View>
    </View>
  )
}
