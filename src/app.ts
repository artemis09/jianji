import { createElement, Fragment, PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import PrivacyAuthorizeModal from '@/components/PrivacyAuthorizeModal'
import { storage } from '@/services/storage'
import { THEMES } from '@/themes/tokens'
import { setupNetworkListener } from '@/services/sync'
import { applyPageBackground } from '@/utils/theme-background'
import { setupWechatPrivacyAuthorization } from '@/utils/wechat-privacy'

import './app.scss'

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    setupNetworkListener()
    setupWechatPrivacyAuthorization()
    applyPageBackground(THEMES[storage.getTheme()].pageBg)
  })

  return createElement(
    ThemeProvider,
    null,
    createElement(
      AuthProvider,
      null,
      createElement(
        Fragment,
        null,
        createElement(PrivacyAuthorizeModal),
        children,
      ),
    ),
  )
}

export default App
