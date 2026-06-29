import type { CategoryIconKey } from './category-icons'

/** 48×48 线描路径 — 参考鲨鱼记账 / 随手记分类图标比例 */
export const CATEGORY_SVG_PATHS: Record<CategoryIconKey, string> = {
  dining: `
    <path d="M14 11v15"/>
    <path d="M18 9v17"/>
    <path d="M26 23h14"/>
    <path d="M26 23c0 8 5.5 12 12 12s12-4 12-12"/>
  `,
  transport: `
    <path d="M9 31h30"/>
    <path d="M13 31v-11l5-8h12l5 8v11"/>
    <circle cx="15" cy="31" r="3.5"/>
    <circle cx="33" cy="31" r="3.5"/>
    <path d="M18 12h12"/>
  `,
  shopping: `
    <path d="M15 19h18l-2.5 17H17.5L15 19z"/>
    <path d="M19 19v-4.5a5 5 0 0 1 10 0V19"/>
  `,
  clothing: `
    <path d="M18 14l6-4 6 4"/>
    <path d="M14 18v18h8V22h4v14h8V18"/>
    <path d="M14 18h8"/>
    <path d="M26 18h8"/>
  `,
  housing: `
    <path d="M24 9L40 21v18H8V21z"/>
    <path d="M19 39v-11h10v11"/>
  `,
  entertainment: `
    <rect x="11" y="19" width="26" height="15" rx="4"/>
    <path d="M17 27v4"/>
    <path d="M15 29h4"/>
    <circle cx="31" cy="25" r="2" fill="CURRENT" stroke="none"/>
    <circle cx="35" cy="29" r="2" fill="CURRENT" stroke="none"/>
  `,
  medical: `
    <rect x="12" y="13" width="24" height="24" rx="4"/>
    <path d="M24 17v16"/>
    <path d="M16 25h16"/>
  `,
  phone: `
    <rect x="17" y="10" width="14" height="28" rx="2"/>
    <path d="M20 14h8"/>
    <circle cx="24" cy="32" r="1.5" fill="CURRENT" stroke="none"/>
  `,
  car: `
    <path d="M8 31h32"/>
    <path d="M12 31v-10l6-9h12l6 9v10"/>
    <circle cx="14" cy="31" r="3"/>
    <circle cx="34" cy="31" r="3"/>
    <path d="M18 12h12"/>
    <path d="M22 12v4"/>
    <path d="M26 12v4"/>
  `,
  social: `
    <path d="M14 30h20"/>
    <path d="M14 30l10-11 10 11"/>
    <path d="M24 19v11"/>
    <path d="M20 24h8"/>
  `,
  childcare: `
    <circle cx="24" cy="21" r="8"/>
    <path d="M17 35c2 5 14 5 16 0"/>
    <circle cx="21" cy="20" r="1.2" fill="CURRENT" stroke="none"/>
    <circle cx="27" cy="20" r="1.2" fill="CURRENT" stroke="none"/>
    <path d="M22 25c1 1 3 1 4 0"/>
  `,
  education: `
    <path d="M10 18h12v20H10z"/>
    <path d="M26 18h12v20H26z"/>
    <path d="M22 18v20"/>
    <path d="M10 18l14-6 14 6"/>
  `,
  pet: `
    <circle cx="17" cy="17" r="3"/>
    <circle cx="24" cy="14" r="3"/>
    <circle cx="31" cy="17" r="3"/>
    <circle cx="19" cy="24" r="2.5"/>
    <circle cx="29" cy="24" r="2.5"/>
    <ellipse cx="24" cy="31" rx="7" ry="6"/>
  `,
  beauty: `
    <circle cx="24" cy="19" r="8"/>
    <path d="M24 27v11"/>
    <path d="M20 38h8"/>
  `,
  travel: `
    <rect x="14" y="20" width="20" height="14" rx="2"/>
    <path d="M18 20v-5h12v5"/>
    <path d="M24 14v6"/>
    <path d="M17 27h14"/>
  `,
  salary: `
    <rect x="9" y="20" width="30" height="16" rx="2"/>
    <path d="M9 26h30"/>
    <rect x="17" y="12" width="14" height="12" rx="1"/>
    <path d="M21 15h6"/>
    <path d="M24 15v6"/>
    <path d="M19 18h10"/>
  `,
  parttime: `
    <circle cx="24" cy="24" r="12"/>
    <circle cx="24" cy="24" r="1.5" fill="CURRENT" stroke="none"/>
    <path d="M22 17h4"/>
    <path d="M24 17v10"/>
    <path d="M20 21h8"/>
  `,
  finance: `
    <path d="M17 14c0-3 2-5 4-6"/>
    <path d="M31 14c0-3-2-5-4-6"/>
    <path d="M14 26h20"/>
    <path d="M14 26c0 7 4.5 10 10 10s10-3 10-10"/>
    <path d="M20 23h2"/>
    <path d="M21 21v4"/>
    <rect x="30" y="18" width="11" height="14" rx="1"/>
    <path d="M32 22h7"/>
    <path d="M32 26h3"/>
    <path d="M36 26h3"/>
    <path d="M32 29h3"/>
    <path d="M36 29h3"/>
  `,
  gift: `
    <path d="M14 30h20"/>
    <path d="M14 30l10-12 10 12"/>
    <path d="M24 18v12"/>
    <path d="M18 22h12"/>
    <path d="M18 22c2 4 10 4 12 0"/>
  `,
  other: `
    <circle cx="24" cy="24" r="11"/>
    <path d="M20 18h8"/>
    <path d="M24 18v12"/>
    <path d="M18 22h12"/>
  `,
  misc: `
    <circle cx="18" cy="18" r="2.5" fill="CURRENT" stroke="none"/>
    <circle cx="30" cy="18" r="2.5" fill="CURRENT" stroke="none"/>
    <circle cx="18" cy="30" r="2.5" fill="CURRENT" stroke="none"/>
    <circle cx="30" cy="30" r="2.5" fill="CURRENT" stroke="none"/>
  `,
  manage: `
    <circle cx="24" cy="24" r="5"/>
    <path d="M24 11v4"/>
    <path d="M24 33v4"/>
    <path d="M11 24h4"/>
    <path d="M33 24h4"/>
    <path d="M15.8 15.8l2.8 2.8"/>
    <path d="M29.4 29.4l2.8 2.8"/>
    <path d="M32.2 15.8l-2.8 2.8"/>
    <path d="M18.6 29.4l-2.8 2.8"/>
  `,
}

/** 分类图标强调色 — 鲨鱼记账风格 */
export const CATEGORY_ICON_ACCENTS: Record<CategoryIconKey, string> = {
  dining: '#FF9500',
  transport: '#2B9EF7',
  shopping: '#E84393',
  clothing: '#FF6B9D',
  entertainment: '#9B59B6',
  medical: '#E74C3C',
  housing: '#27AE60',
  phone: '#5AC8FA',
  car: '#5856D6',
  social: '#FF2D55',
  childcare: '#FF9F0A',
  education: '#34C759',
  pet: '#AF52DE',
  beauty: '#FF6482',
  travel: '#00C7BE',
  salary: '#F39C12',
  parttime: '#3498DB',
  finance: '#8B5CF6',
  gift: '#E84393',
  other: '#8E8E93',
  misc: '#8E8E93',
  manage: '#8E8E93',
}

export type TabSvgIconName = 'list' | 'chart' | 'bill' | 'profile' | 'add'

export const TAB_SVG_PATHS: Record<TabSvgIconName, string> = {
  list: `
    <rect x="12" y="8" width="24" height="32" rx="3"/>
    <path d="M18 17h12"/>
    <path d="M18 23h12"/>
    <path d="M18 29h8"/>
  `,
  chart: `
    <circle cx="24" cy="24" r="14"/>
    <path d="M24 24V10a14 14 0 0 1 12.1 7" fill="CURRENT" stroke="none" opacity="0.9"/>
  `,
  bill: `
    <path d="M14 8h20v30l-4-2.5-4 2.5-4-2.5-4 2.5-4-2.5V8z"/>
    <path d="M18 16h12"/>
    <path d="M18 22h12"/>
    <path d="M18 28h8"/>
  `,
  profile: `
    <circle cx="24" cy="24" r="14"/>
    <circle cx="24" cy="20" r="5"/>
    <path d="M14 36c0-6 4.5-10 10-10s10 4 10 10"/>
  `,
  add: `
    <path d="M24 12v24" stroke-width="3.5"/>
    <path d="M12 24h24" stroke-width="3.5"/>
  `,
}
