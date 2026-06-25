import { createElement, PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import { ThemeProvider } from '@/contexts/ThemeContext'

import './app.scss'

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    console.log('App launched.')
  })

  return createElement(ThemeProvider, null, children)
}
  


export default App
