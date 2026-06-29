import { useLayoutEffect } from 'react'
import { useDidShow } from '@tarojs/taro'
import { useTheme } from '@/contexts/ThemeContext'
import { applyPageBackground } from '@/utils/theme-background'

/** Tab 页显示时再次同步窗口底色（切换 Tab 时 useLayoutEffect 不会重跑） */
export function useThemeBackground(): void {
  const { theme } = useTheme()

  useLayoutEffect(() => {
    applyPageBackground(theme.pageBg)
  }, [theme.pageBg])

  useDidShow(() => {
    applyPageBackground(theme.pageBg)
  })
}
