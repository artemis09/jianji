import { useMemo } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

export function usePickerWheelStyle() {
  const { theme } = useTheme()

  return useMemo(() => ({
    indicatorStyle: `height: 48px; border-top: 1px solid ${theme.surfaceBorder}; border-bottom: 1px solid ${theme.surfaceBorder}`,
    maskStyle: [
      `background-image: linear-gradient(180deg, ${theme.pageBg}ee, ${theme.pageBg}33)`,
      `linear-gradient(0deg, ${theme.pageBg}ee, ${theme.pageBg}33)`,
    ].join(', '),
  }), [theme.pageBg, theme.surfaceBorder])
}
