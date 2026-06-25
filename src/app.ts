import { createElement, PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { setupNetworkListener, triggerSync } from '@/services/sync'

import './app.scss'

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    setupNetworkListener()
    void triggerSync()
  })

  return createElement(ThemeProvider, null, children)
}
  


export default App
