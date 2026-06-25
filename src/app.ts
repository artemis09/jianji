import { createElement, PropsWithChildren } from 'react'
import Taro, { useLaunch } from '@tarojs/taro'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { setupNetworkListener, triggerSync } from '@/services/sync'

import './app.scss'

function AppBootstrap({ children }: PropsWithChildren<any>) {
  const { login } = useAuth()

  useLaunch(() => {
    setupNetworkListener()

    void (async () => {
      try {
        const user = await login()
        if (!user.phone) {
          Taro.redirectTo({ url: '/pages/login/index' })
          return
        }
        await triggerSync()
      } catch (err) {
        console.error('silentLogin failed', err)
      }
    })()
  })

  return children
}

function App({ children }: PropsWithChildren<any>) {
  return createElement(
    ThemeProvider,
    null,
    createElement(
      AuthProvider,
      null,
      createElement(AppBootstrap, null, children),
    ),
  )
}

export default App
