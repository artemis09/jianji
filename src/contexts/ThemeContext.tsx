import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { View } from '@tarojs/components'
import type { ThemeId, ThemeTokens } from '@/types'
import { storage } from '@/services/storage'
import { applyTheme, getThemeCssVars } from '@/themes/apply-theme'
import { THEMES } from '@/themes/tokens'

interface ThemeContextValue {
  themeId: ThemeId
  theme: ThemeTokens
  setTheme: (id: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: PropsWithChildren) {
  const [themeId, setThemeId] = useState<ThemeId>(() => storage.getTheme())

  const setTheme = useCallback((id: ThemeId) => {
    setThemeId(id)
    storage.setTheme(id)

    const user = storage.getUser()
    if (user) {
      storage.setUser({ ...user, theme: id })
    }
  }, [])

  useEffect(() => {
    if (process.env.TARO_ENV === 'h5' && typeof document !== 'undefined') {
      applyTheme(document.documentElement, themeId)
    }
  }, [themeId])

  const themeStyle = useMemo(() => getThemeCssVars(themeId), [themeId])

  const value = useMemo(
    () => ({
      themeId,
      theme: THEMES[themeId],
      setTheme,
    }),
    [themeId, setTheme],
  )

  return (
    <ThemeContext.Provider value={value}>
      <View className='theme-root' style={themeStyle} data-theme={themeId}>
        {children}
      </View>
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
