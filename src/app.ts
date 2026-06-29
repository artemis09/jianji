import { createElement, PropsWithChildren } from 'react'
import Taro, { useLaunch } from '@tarojs/taro'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { setupNetworkListener } from '@/services/sync'

import './app.scss'

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    setupNetworkListener()
  })

  return createElement(
    ThemeProvider,
    null,
    createElement(AuthProvider, null, children),
  )
}

export default App
