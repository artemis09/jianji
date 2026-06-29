import { View, ScrollView } from '@tarojs/components'
import type { PropsWithChildren, ReactNode } from 'react'
import AppTabBar from '@/components/AppTabBar'
import type { AppTabKey } from '@/components/AppTabBar/types'
import { useThemeBackground } from '@/hooks/useThemeBackground'
import { useTheme } from '@/contexts/ThemeContext'
import './index.scss'

interface TabPageShellProps extends PropsWithChildren {
  activeTab: AppTabKey
  pageClass?: string
  hideTabBar?: boolean
  /** 浮层（记账弹窗等），须渲染在 ScrollView 外以免被裁剪 */
  overlay?: ReactNode
}

/**
 * Tab 页外壳：100vh flex 布局 + 内容区独立滚动。
 * 微信小程序内嵌 position:fixed 易失效，底栏用 flex 贴底更可靠。
 */
export default function TabPageShell({
  activeTab,
  pageClass = '',
  hideTabBar,
  overlay,
  children,
}: TabPageShellProps) {
  useThemeBackground()
  const { themeId, theme } = useTheme()
  const bodyClass = ['tab-page-shell__body', 'page', pageClass].filter(Boolean).join(' ')
  const pageBgStyle = { backgroundColor: theme.pageBg }

  return (
    <View
      className={`tab-page-shell theme-root theme-root--${themeId}`}
      style={pageBgStyle}
    >
      <ScrollView
        scrollY
        className='tab-page-shell__scroll'
        enhanced
        showScrollbar={false}
        style={pageBgStyle}
      >
        <View className={bodyClass} style={pageBgStyle}>{children}</View>
      </ScrollView>
      {!hideTabBar && <AppTabBar activeTab={activeTab} />}
      {overlay ? <View className='tab-page-shell__overlay'>{overlay}</View> : null}
    </View>
  )
}
