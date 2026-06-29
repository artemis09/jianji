import { View } from '@tarojs/components'
import SvgIcon from '@/components/SvgIcon'
import { useTheme } from '@/contexts/ThemeContext'
import { TAB_SVG_PATHS, type TabSvgIconName } from '@/constants/svg-icon-paths'
import './index.scss'

export type TabIconName = TabSvgIconName

interface TabIconProps {
  name: TabIconName
  active?: boolean
  size?: 'tab' | 'fab'
}

export default function TabIcon({ name, active, size = 'tab' }: TabIconProps) {
  const { theme } = useTheme()
  const base = `tab-icon tab-icon--${name} tab-icon--${size} ${active ? 'tab-icon--active' : ''}`
  const iconSize = size === 'fab' ? 36 : 40

  if (name === 'add') {
    return (
      <View className={base}>
        <SvgIcon
          paths={TAB_SVG_PATHS.add}
          color={theme.btnText}
          size={iconSize}
          strokeWidth={3.5}
        />
      </View>
    )
  }

  const stroke = active ? theme.primary : theme.textSecondary

  return (
    <View className={base}>
      <View className={`tab-icon__glyph ${active ? 'tab-icon__glyph--active' : ''}`}>
        <SvgIcon paths={TAB_SVG_PATHS[name]} color={stroke} size={iconSize} strokeWidth={2.2} />
      </View>
    </View>
  )
}
