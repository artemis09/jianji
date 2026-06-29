import { View } from '@tarojs/components'
import { useMemo } from 'react'
import SvgIcon from '@/components/SvgIcon'
import { useTheme } from '@/contexts/ThemeContext'
import type { CategoryIconKey } from '@/constants/category-icons'
import { CATEGORY_SVG_PATHS, CATEGORY_ICON_ACCENTS } from '@/constants/svg-icon-paths'
import { hexToRgba } from '@/utils/svg-icon'
import './index.scss'

interface CategoryIconProps {
  iconKey: CategoryIconKey
  size?: 'md' | 'sm'
  active?: boolean
  /** 是否显示分类淡色圆底（记账网格用） */
  tinted?: boolean
}

const SIZE_MAP = { md: 44, sm: 30 } as const

export default function CategoryIcon({
  iconKey,
  size = 'md',
  active,
  tinted = true,
}: CategoryIconProps) {
  const { theme } = useTheme()
  const px = SIZE_MAP[size]
  const accent = CATEGORY_ICON_ACCENTS[iconKey]
  const stroke = active ? theme.primary : accent

  const wrapStyle = useMemo(() => {
    if (!tinted || iconKey === 'manage') return undefined
    return { background: hexToRgba(accent, 0.14) }
  }, [tinted, iconKey, accent])

  return (
    <View
      className={`cat-icon cat-icon--${size} ${active ? 'cat-icon--active' : ''} ${tinted ? 'cat-icon--tinted' : ''}`}
      style={wrapStyle}
    >
      <SvgIcon
        paths={CATEGORY_SVG_PATHS[iconKey]}
        color={stroke}
        size={px}
        strokeWidth={size === 'sm' ? 2.4 : 2.2}
      />
    </View>
  )
}
