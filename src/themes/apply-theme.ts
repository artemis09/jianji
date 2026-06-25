import type { ThemeId, ThemeTokens } from '@/types'
import { THEMES } from './tokens'

const TOKEN_CSS_VARS: Record<keyof ThemeTokens, string> = {
  pageBg: '--page-bg',
  surface: '--surface',
  surfaceBorder: '--surface-border',
  textPrimary: '--text-primary',
  textSecondary: '--text-secondary',
  primary: '--primary',
  primaryGradient: '--primary-gradient',
  btnGradient: '--btn-gradient',
  expense: '--expense',
  income: '--income',
  glow: '--glow',
}

export function tokensToCssVars(tokens: ThemeTokens): Record<string, string> {
  const vars: Record<string, string> = {}
  ;(Object.keys(TOKEN_CSS_VARS) as Array<keyof ThemeTokens>).forEach((key) => {
    const value = tokens[key]
    if (value) {
      vars[TOKEN_CSS_VARS[key]] = value
    }
  })
  return vars
}

export function getThemeCssVars(themeId: ThemeId): Record<string, string> {
  return tokensToCssVars(THEMES[themeId])
}

export function applyTheme(root: HTMLElement, themeId: ThemeId): void {
  const vars = getThemeCssVars(themeId)
  Object.entries(vars).forEach(([name, value]) => {
    root.style.setProperty(name, value)
  })
  root.dataset.theme = themeId
}
