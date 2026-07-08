import { useLayoutEffect } from 'react'
import { useDidShow } from '@tarojs/taro'
import { useTheme } from '@/contexts/ThemeContext'
import { applyPageBackground } from '@/utils/theme-background'

/** 非 Tab 页：同步窗口底色与主题 */
export function useThemeBackground(): void {
  const { theme } = useTheme()

  useLayoutEffect(() => {
    applyPageBackground(theme.pageBg)
  }, [theme.pageBg])

  useDidShow(() => {
    applyPageBackground(theme.pageBg)
  })
}
