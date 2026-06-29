import { createElement, PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { storage } from '@/services/storage'
import { THEMES } from '@/themes/tokens'
import { setupNetworkListener } from '@/services/sync'
import { applyPageBackground } from '@/utils/theme-background'

import './app.scss'

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    setupNetworkListener()
    applyPageBackground(THEMES[storage.getTheme()].pageBg)
  })

  return createElement(
    ThemeProvider,
    null,
    createElement(AuthProvider, null, children),
  )
}

export default App
