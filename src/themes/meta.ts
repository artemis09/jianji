import type { ThemeId } from '@/types'

export interface ThemeMeta {
  name: string
  subtitle: string
  /** 结余卡渐变描边 */
  accentCard: boolean
  /** 明细页时间轴样式 */
  timeline: boolean
  isDark: boolean
  preview: {
    bg: string
    surface: string
    primary: string
    income: string
    expense: string
  }
}

export const THEME_META: Record<ThemeId, ThemeMeta> = {
  shark: {
    name: '经典暖阳',
    subtitle: '深灰底 · 暖黄强调',
    accentCard: true,
    timeline: true,
    isDark: true,
    preview: { bg: '#1A1A1A', surface: '#2C2C2E', primary: '#FFBE0A', income: '#34C759', expense: '#FF6B4A' },
  },
  qing: {
    name: '薄荷清新',
    subtitle: '薄荷白底 · 治愈绿意',
    accentCard: false,
    timeline: false,
    isDark: false,
    preview: { bg: '#F5FAF8', surface: '#FFFFFF', primary: '#00C9A7', income: '#00C9A7', expense: '#FF6B6B' },
  },
  suishou: {
    name: '橙蓝商务',
    subtitle: '白净底 · 橙蓝对比',
    accentCard: false,
    timeline: false,
    isDark: false,
    preview: { bg: '#F7F8FA', surface: '#FFFFFF', primary: '#FF6633', income: '#1677FF', expense: '#FF6633' },
  },
  miao: {
    name: '粉紫萌系',
    subtitle: '粉紫渐变 · 软萌圆润',
    accentCard: false,
    timeline: false,
    isDark: false,
    preview: { bg: '#FFF5F8', surface: '#FFFFFF', primary: '#FF85B3', income: '#7B9EFF', expense: '#FF6B9D' },
  },
  midnight: {
    name: '午夜沉浸',
    subtitle: '纯黑 OLED · 琥珀微光',
    accentCard: true,
    timeline: false,
    isDark: true,
    preview: { bg: '#000000', surface: '#1C1C1E', primary: '#FFD60A', income: '#30D158', expense: '#FF453A' },
  },
}

/** 旧版主题 ID 迁移 */
export const LEGACY_THEME_MAP: Record<string, ThemeId> = {
  warm: 'shark',
  mint: 'qing',
  dark: 'midnight',
  candy: 'miao',
  caramel: 'suishou',
}

export function normalizeThemeId(id: string | undefined | null): ThemeId {
  if (!id) return 'shark'
  if (id in THEME_META) return id as ThemeId
  return LEGACY_THEME_MAP[id] || 'shark'
}
