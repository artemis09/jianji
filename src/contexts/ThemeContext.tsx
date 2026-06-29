import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import type { ThemeId, ThemeTokens } from '@/types'
import { storage } from '@/services/storage'
import { THEMES } from '@/themes/tokens'
import { applyPageBackground } from '@/utils/theme-background'

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

  const value = useMemo(
    () => ({
      themeId,
      theme: THEMES[themeId],
      setTheme,
    }),
    [themeId, setTheme],
  )

  useLayoutEffect(() => {
    applyPageBackground(THEMES[themeId].pageBg)
  }, [themeId])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
