import { useTheme } from '@/contexts/ThemeContext'

export function useThemePageClass(baseClass: string): string {
  const { themeId } = useTheme()
  return `${baseClass} theme-root theme-root--${themeId}`
}
