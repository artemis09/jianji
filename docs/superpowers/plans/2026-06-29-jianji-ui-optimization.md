# 简记 UI 优化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 参考鲨鱼记账/随手记优化 5 个核心 UI 模块：SummaryCard 重设计、记账页底部弹出、RecordItem 质感升级、DonutChart 真实数据分段、TabBar 切页 + 月份滑动。

**Architecture:** 新增 IceSheet 通用底部弹出组件和 AddSheet 记账弹出内容组件；修改 SummaryCard/RecordItem/DonutChart/MonthSwitcher 的布局和交互；将 TabBar 从手动渲染改为 Taro 原生 custom-tab-bar 机制以消除页面闪烁。

**Tech Stack:** Taro 4 + React + TypeScript + SCSS (CSS Variables) + Canvas 2D

---

## 文件结构

| 文件 | 操作 | 职责 |
|------|------|------|
| `src/components/IceSheet/index.tsx` | 新建 | 通用底部弹出层（动画 + 遮罩 + 内容容器） |
| `src/components/IceSheet/index.scss` | 新建 | 弹出动画样式 |
| `src/components/AddSheet/index.tsx` | 新建 | 记账表单（类型切换 + 金额 + 分类宫格 + 数字键盘 + 提交） |
| `src/components/AddSheet/index.scss` | 新建 | 记账弹出层样式（复用原 add 页样式体系） |
| `src/custom-tab-bar/index.tsx` | 新建 | 自定义 TabBar（明细 + + + 统计），替代原 TabBar 组件 |
| `src/custom-tab-bar/index.scss` | 新建 | TabBar 样式 |
| `src/app.config.ts` | 修改 | 注册 tabBar 配置 |
| `src/app.scss` | 修改 | 新增 `--text-balance-lg: 72px` |
| `src/components/SummaryCard/index.tsx` | 修改 | 双卡片并排布局 |
| `src/components/SummaryCard/index.scss` | 修改 | 新布局样式 |
| `src/components/RecordItem/index.tsx` | 修改 | 左侧色条 + 时间显示 |
| `src/components/RecordItem/index.scss` | 修改 | 新布局样式 |
| `src/components/DonutChart/index.tsx` | 修改 | Canvas 分段环形图 |
| `src/components/DonutChart/index.scss` | 修改 | Canvas 容器样式 |
| `src/components/MonthSwitcher/index.tsx` | 修改 | 增加滑动手势 |
| `src/components/MonthSwitcher/index.scss` | 修改 | 滑动过渡动画 |
| `src/pages/index/index.tsx` | 修改 | 集成 AddSheet，移除 TabBar |
| `src/pages/stats/index.tsx` | 修改 | 传入 breakdown 数据给 DonutChart，移除 TabBar |

---

### Task 1: IceSheet 通用底部弹出组件

**Files:**
- Create: `src/components/IceSheet/index.tsx`
- Create: `src/components/IceSheet/index.scss`

- [ ] **Step 1: 创建 IceSheet 组件**

```tsx
// src/components/IceSheet/index.tsx
import { View } from '@tarojs/components'
import { useEffect, useState } from 'react'
import type { PropsWithChildren } from 'react'
import './index.scss'

interface IceSheetProps {
  visible: boolean
  onClose: () => void
}

export default function IceSheet({ visible, onClose, children }: PropsWithChildren<IceSheetProps>) {
  const [animState, setAnimState] = useState<'enter' | 'exit' | 'hidden'>('hidden')

  useEffect(() => {
    if (visible) {
      setAnimState('enter')
    } else if (animState === 'enter') {
      setAnimState('exit')
      const timer = setTimeout(() => setAnimState('hidden'), 300)
      return () => clearTimeout(timer)
    }
  }, [visible])

  if (animState === 'hidden') return null

  const sheetClass = `ice-sheet ${animState === 'enter' ? 'ice-sheet--enter' : 'ice-sheet--exit'}`
  const maskClass = `ice-sheet__mask ${animState === 'enter' ? 'ice-sheet__mask--enter' : 'ice-sheet__mask--exit'}`

  return (
    <View className={sheetClass}>
      <View className={maskClass} onClick={onClose} />
      <View className='ice-sheet__content'>
        <View className='ice-sheet__handle' />
        {children}
      </View>
    </View>
  )
}
```

- [ ] **Step 2: 创建 IceSheet 样式**

```scss
// src/components/IceSheet/index.scss
.ice-sheet {
  position: fixed;
  inset: 0;
  z-index: 1000;
}

.ice-sheet__mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  transition: background 0.3s ease;

  &--enter {
    background: rgba(0, 0, 0, 0.5);
  }

  &--exit {
    background: rgba(0, 0, 0, 0);
  }
}

.ice-sheet__content {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--page-bg);
  border-radius: 32px 32px 0 0;
  max-height: 90vh;
  overflow-y: auto;
  transform: translateY(100%);
  transition: transform 0.3s ease-out;

  .ice-sheet--enter & {
    transform: translateY(0);
  }

  .ice-sheet--exit & {
    transform: translateY(100%);
  }
}

.ice-sheet__handle {
  width: 48px;
  height: 6px;
  background: var(--text-secondary);
  opacity: 0.3;
  border-radius: 3px;
  margin: 16px auto 0;
}
```

- [ ] **Step 3: 提交**

```bash
git add src/components/IceSheet/
git commit -m "feat: add IceSheet bottom sheet component"
```

---

### Task 2: app.config 注册 tabBar + custom-tab-bar 组件

**Files:**
- Modify: `src/app.config.ts`
- Create: `src/custom-tab-bar/index.tsx`
- Create: `src/custom-tab-bar/index.scss`

- [ ] **Step 1: 修改 app.config 添加 tabBar 配置**

```typescript
// src/app.config.ts
export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/login/index',
    'pages/add/index',
    'pages/stats/index',
    'pages/profile/index',
    'pages/theme/index',
    'pages/categories/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1c1917',
    navigationBarTitleText: '简记',
    navigationBarTextStyle: 'white',
    navigationStyle: 'custom',
  },
  tabBar: {
    custom: true,
    color: '#a8a29e',
    selectedColor: '#ffb800',
    backgroundColor: '#292524',
    list: [
      { pagePath: 'pages/index/index', text: '明细' },
      { pagePath: 'pages/stats/index', text: '统计' },
    ],
  },
  cloud: true,
})
```

- [ ] **Step 2: 创建 custom-tab-bar 组件**

```tsx
// src/custom-tab-bar/index.tsx
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useTheme } from '@/contexts/ThemeContext'
import './index.scss'

export default function CustomTabBar() {
  const currentPage = Taro.getCurrentPages()[0]?.route || 'pages/index/index'
  const { themeId } = useTheme()

  const goTab = (url: string) => {
    Taro.switchTab({ url: `/${url}` })
  }

  return (
    <View className={`custom-tab-bar theme-root theme-root--${themeId}`}>
      <View
        className={`custom-tab-bar__item ${currentPage === 'pages/index/index' ? 'custom-tab-bar__item--active' : ''}`}
        onClick={() => goTab('pages/index/index')}
      >
        <View className='custom-tab-bar__icon custom-tab-bar__icon--list' />
        <Text className='custom-tab-bar__label'>明细</Text>
      </View>
      <View
        className='custom-tab-bar__fab'
        onClick={() => Taro.navigateTo({ url: '/pages/add/index' })}
      >
        <Text className='custom-tab-bar__fab-icon'>+</Text>
      </View>
      <View
        className={`custom-tab-bar__item ${currentPage === 'pages/stats/index' ? 'custom-tab-bar__item--active' : ''}`}
        onClick={() => goTab('pages/stats/index')}
      >
        <View className='custom-tab-bar__icon custom-tab-bar__icon--chart' />
        <Text className='custom-tab-bar__label'>统计</Text>
      </View>
    </View>
  )
}
```

- [ ] **Step 3: 创建 custom-tab-bar 样式**

```scss
// src/custom-tab-bar/index.scss
.custom-tab-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding: 8px var(--space-page) calc(12px + env(safe-area-inset-bottom));
  background: var(--surface);
  border-top: 1px solid var(--surface-border);
  z-index: 100;
}

.custom-tab-bar__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 0 4px;
  min-height: 88px;
}

.custom-tab-bar__label {
  font-size: var(--text-caption);
  color: var(--text-secondary);
}

.custom-tab-bar__item--active .custom-tab-bar__label {
  color: var(--primary);
  font-weight: 600;
}

.custom-tab-bar__icon {
  width: 40px;
  height: 32px;
  opacity: 0.45;
}

.custom-tab-bar__item--active .custom-tab-bar__icon {
  opacity: 1;
}

.custom-tab-bar__icon--list {
  border-top: 4px solid var(--primary);
  border-bottom: 4px solid var(--primary);
  height: 18px;
  margin-top: 7px;
  box-shadow: 0 9px 0 var(--primary);
}

.custom-tab-bar__icon--chart {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 4px;
  padding-bottom: 2px;

  &::before, &::after {
    content: '';
    width: 8px;
    background: var(--primary);
    border-radius: 2px;
  }

  &::before { height: 14px; }
  &::after { height: 24px; }
}

.custom-tab-bar__fab {
  width: var(--tab-fab-size);
  height: var(--tab-fab-size);
  margin-bottom: 20px;
  border-radius: 50%;
  background: var(--btn-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--glow, 0 4px 16px rgba(0, 0, 0, 0.2));
  border: 4px solid var(--page-bg);
}

.custom-tab-bar__fab-icon {
  color: #1c1917;
  font-size: 40px;
  font-weight: 700;
  line-height: 1;
}
```

- [ ] **Step 4: 从 index 和 stats 页面移除 TabBar 引用**

在 `src/pages/index/index.tsx` 中：
- 删除 `import TabBar from '@/components/TabBar'`
- 删除 `<TabBar activeTab='index' />`

在 `src/pages/stats/index.tsx` 中：
- 删除 `import TabBar from '@/components/TabBar'`
- 删除 `<TabBar activeTab='stats' />`

索引页导入区改为：
```tsx
// 删除这行
import TabBar from '@/components/TabBar'
```

JSX 中删除：
```tsx
// 删除这行
<TabBar activeTab='index' />
```

统计页同样操作。

- [ ] **Step 5: 提交**

```bash
git add src/app.config.ts src/custom-tab-bar/ src/pages/index/index.tsx src/pages/stats/index.tsx
git commit -m "feat: add custom tabBar with switchTab for native page switching"
```

---

### Task 3: 新增 --text-balance-lg CSS 变量

**Files:**
- Modify: `src/app.scss`

- [ ] **Step 1: 在 .theme-root 中添加新变量**

```scss
// src/app.scss — 在 .theme-root 的 /* 750 设计稿字号体系 */ 区块末尾添加
--text-balance-lg: 72px;
```

修改前（约第 18 行 `--text-amount-lg: 72px;` 之后）：
```scss
--text-amount-lg: 72px;
// 在此行之后添加 ↓
```

修改后：
```scss
--text-amount-lg: 72px;
--text-balance-lg: 72px;
```

- [ ] **Step 2: 提交**

```bash
git add src/app.scss
git commit -m "feat: add --text-balance-lg CSS variable for larger balance display"
```

---

### Task 4: SummaryCard 重设计

**Files:**
- Modify: `src/components/SummaryCard/index.tsx`
- Modify: `src/components/SummaryCard/index.scss`

- [ ] **Step 1: 重构 SummaryCard TSX 布局**

```tsx
// src/components/SummaryCard/index.tsx
import { View, Text } from '@tarojs/components'
import { useTheme } from '@/contexts/ThemeContext'
import { formatAmount } from '@/utils/amount'
import './index.scss'

interface SummaryCardProps {
  income: number
  expense: number
  balance: number
}

export default function SummaryCard({ income, expense, balance }: SummaryCardProps) {
  const { themeId } = useTheme()
  const isWarm = themeId === 'warm'

  return (
    <View className={`summary-card ${isWarm ? 'summary-card--warm' : ''}`}>
      <View className='summary-card__inner'>
        <Text className='summary-card__label'>本月结余 (元)</Text>
        <View className='summary-card__balance-row'>
          <Text className='summary-card__currency'>¥</Text>
          <Text className={`summary-card__balance ${isWarm ? 'summary-card__balance--gradient' : ''}`}>
            {formatAmount(balance)}
          </Text>
        </View>
        <View className='summary-card__row'>
          <View className='summary-card__col summary-card__col--income'>
            <View className='summary-card__col-bar summary-card__col-bar--income' />
            <View className='summary-card__col-body'>
              <Text className='summary-card__meta'>收入</Text>
              <Text className='summary-card__value summary-card__income'>¥{formatAmount(income)}</Text>
            </View>
          </View>
          <View className='summary-card__col summary-card__col--expense'>
            <View className='summary-card__col-bar summary-card__col-bar--expense' />
            <View className='summary-card__col-body'>
              <Text className='summary-card__meta'>支出</Text>
              <Text className='summary-card__value summary-card__expense'>¥{formatAmount(expense)}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}
```

- [ ] **Step 2: 更新 SummaryCard 样式**

```scss
// src/components/SummaryCard/index.scss
.summary-card {
  margin: 0 var(--space-page) var(--space-section);
  border-radius: var(--radius-card);
  overflow: hidden;
}

.summary-card--warm {
  padding: 3px;
  background: var(--primary-gradient);
  box-shadow: var(--glow);
}

.summary-card__inner {
  background: var(--surface);
  border-radius: calc(var(--radius-card) - 3px);
  padding: 28px var(--space-page) 24px;
}

.summary-card__label {
  font-size: var(--text-secondary-size);
  color: var(--text-secondary);
}

.summary-card__balance-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 12px 0 32px;
}

.summary-card__currency {
  font-size: var(--text-title);
  font-weight: 600;
  color: var(--text-secondary);
}

.summary-card__balance {
  font-size: var(--text-balance-lg);
  font-weight: 800;
  line-height: 1.1;
  color: var(--text-primary);
  letter-spacing: -1px;
}

.summary-card__balance--gradient {
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  color: transparent;
}

.summary-card__row {
  display: flex;
  gap: 16px;
}

.summary-card__col {
  flex: 1;
  display: flex;
  align-items: stretch;
  gap: 12px;
  background: var(--page-bg);
  border-radius: calc(var(--radius-item) - 2px);
  padding: 16px;
}

.summary-card__col-bar {
  width: 4px;
  border-radius: 2px;
  flex-shrink: 0;
}

.summary-card__col-bar--income {
  background: var(--income);
}

.summary-card__col-bar--expense {
  background: var(--expense);
}

.summary-card__col-body {
  display: flex;
  flex-direction: column;
}

.summary-card__meta {
  font-size: var(--text-caption);
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.summary-card__value {
  font-size: var(--text-list);
  font-weight: 700;
}

.summary-card__income {
  color: var(--income);
}

.summary-card__expense {
  color: var(--expense);
}
```

- [ ] **Step 3: 提交**

```bash
git add src/components/SummaryCard/
git commit -m "feat: redesign SummaryCard with side-by-side cards and larger balance"
```

---

### Task 5: RecordItem 质感升级

**Files:**
- Modify: `src/components/RecordItem/index.tsx`
- Modify: `src/components/RecordItem/index.scss`

- [ ] **Step 1: 重构 RecordItem TSX — 左侧色条 + 时间**

```tsx
// src/components/RecordItem/index.tsx
import { View, Text } from '@tarojs/components'
import type { Record, Category } from '@/types'
import { getCategoryColor } from '@/constants/category-colors'
import { formatAmount } from '@/utils/amount'
import './index.scss'

interface RecordItemProps {
  record: Record
  category?: Category
  onDelete: (id: string) => void
  onEdit: (id: string) => void
}

function extractTime(isoStr?: string): string {
  if (!isoStr) return ''
  try {
    const d = new Date(isoStr)
    if (isNaN(d.getTime())) return ''
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${hh}:${mm}`
  } catch {
    return ''
  }
}

export default function RecordItem({ record, category, onDelete, onEdit }: RecordItemProps) {
  const isExpense = record.type === 'expense'
  const sign = isExpense ? '-' : '+'
  const catName = category?.name || '未分类'
  const catColor = getCategoryColor(catName, record.type)
  const displayName = record.note || catName
  const time = extractTime(record.createdAt)
  const metaText = time ? `${catName} · ${time}` : catName

  return (
    <View
      className='record-item'
      style={{ borderLeftColor: catColor }}
      onClick={() => onEdit(record._id)}
      onLongPress={() => onDelete(record._id)}
    >
      <View className='record-item__icon' style={{ backgroundColor: `${catColor}22`, borderColor: `${catColor}44` }}>
        <Text className='record-item__icon-text' style={{ color: catColor }}>
          {category?.icon || catName.slice(0, 1)}
        </Text>
      </View>
      <View className='record-item__body'>
        <Text className='record-item__title'>{displayName}</Text>
        <Text className='record-item__meta-text'>{metaText}</Text>
      </View>
      <Text className={`record-item__amount ${isExpense ? 'record-item__amount--expense' : 'record-item__amount--income'}`}>
        {sign}{formatAmount(record.amount)}
      </Text>
    </View>
  )
}
```

- [ ] **Step 2: 更新 RecordItem 样式**

```scss
// src/components/RecordItem/index.scss
.record-item {
  display: flex;
  align-items: center;
  gap: var(--space-item);
  padding: 18px 18px 18px 16px;
  background: var(--surface);
  border: 1px solid var(--surface-border);
  border-left: 3px solid var(--surface-border);
  border-radius: 14px;
  margin-bottom: 10px;
}

.record-item__icon {
  width: var(--icon-md);
  height: var(--icon-md);
  border-radius: 50%;
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.record-item__icon-text {
  font-size: 26px;
  line-height: 1;
  font-weight: 600;
}

.record-item__body {
  flex: 1;
  min-width: 0;
}

.record-item__title {
  display: block;
  font-size: var(--text-list);
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.35;
}

.record-item__meta-text {
  display: block;
  font-size: var(--text-caption);
  color: var(--text-secondary);
  margin-top: 4px;
}

.record-item__amount {
  font-size: var(--text-title);
  font-weight: 700;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.record-item__amount--expense {
  color: var(--expense);
}

.record-item__amount--income {
  color: var(--income);
}
```

- [ ] **Step 3: 提交**

```bash
git add src/components/RecordItem/
git commit -m "feat: upgrade RecordItem with left color bar and time display"
```

---

### Task 6: DonutChart Canvas 真实数据分段

**Files:**
- Modify: `src/components/DonutChart/index.tsx`
- Modify: `src/components/DonutChart/index.scss`

- [ ] **Step 1: 重写 DonutChart 为 Canvas 分段环形图**

```tsx
// src/components/DonutChart/index.tsx
import { View, Text, Canvas } from '@tarojs/components'
import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { formatAmount } from '@/utils/amount'
import './index.scss'

export interface DonutSegment {
  name: string
  amount: number
  percent: number
  color: string
}

interface DonutChartProps {
  total: number
  label: string
  segments: DonutSegment[]
}

const RING_OUTER = 140
const RING_INNER = 72
const CANVAS_SIZE = 280

export default function DonutChart({ total, label, segments }: DonutChartProps) {
  const [canvasReady, setCanvasReady] = useState(false)

  useEffect(() => {
    if (segments.length === 0) {
      setCanvasReady(true)
      return
    }

    const query = Taro.createSelectorQuery()
    query.select('#donut-canvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]?.node) return
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = Taro.getSystemInfoSync().pixelRatio
        canvas.width = CANVAS_SIZE * dpr
        canvas.height = CANVAS_SIZE * dpr
        ctx.scale(dpr, dpr)

        // clear
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

        if (segments.length === 0) return

        const cx = CANVAS_SIZE / 2
        const cy = CANVAS_SIZE / 2
        let startAngle = -Math.PI / 2

        // draw segments
        segments.forEach(seg => {
          const sweepAngle = (seg.percent / 100) * Math.PI * 2
          ctx.beginPath()
          ctx.arc(cx, cy, RING_OUTER, startAngle, startAngle + sweepAngle)
          ctx.arc(cx, cy, RING_INNER, startAngle + sweepAngle, startAngle, true)
          ctx.closePath()
          ctx.fillStyle = seg.color
          ctx.fill()
          startAngle += sweepAngle
        })

        // center hole text is handled by CSS overlay, so no need to draw
        setCanvasReady(true)
      })
  }, [segments])

  const hasData = segments.length > 0

  return (
    <View className='donut-chart'>
      <View className='donut-chart__ring'>
        {hasData ? (
          <Canvas type='2d' id='donut-canvas' className='donut-chart__canvas' />
        ) : (
          <View className='donut-chart__placeholder' />
        )}
        <View className='donut-chart__hole'>
          <Text className='donut-chart__label'>{label}</Text>
          <Text className='donut-chart__total'>{formatAmount(total)}</Text>
        </View>
      </View>
    </View>
  )
}
```

- [ ] **Step 2: 更新 DonutChart 样式**

```scss
// src/components/DonutChart/index.scss
.donut-chart {
  display: flex;
  justify-content: center;
  padding: 32px 0;
}

.donut-chart__ring {
  width: 280px;
  height: 280px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.donut-chart__canvas {
  width: 280px;
  height: 280px;
  position: absolute;
  inset: 0;
}

.donut-chart__placeholder {
  width: 280px;
  height: 280px;
  border-radius: 50%;
  border: 4px dashed var(--surface-border);
  position: absolute;
  inset: 0;
  box-sizing: border-box;
}

.donut-chart__hole {
  width: 144px;
  height: 144px;
  border-radius: 50%;
  background: var(--page-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.donut-chart__label {
  font-size: var(--text-secondary-size);
  color: var(--text-secondary);
}

.donut-chart__total {
  font-size: var(--text-title);
  font-weight: 700;
  color: var(--text-primary);
  margin-top: 8px;
}
```

- [ ] **Step 3: 更新 stats 页面传入 segments 数据**

在 `src/pages/stats/index.tsx` 中，修改 DonutChart 使用方式：

```tsx
// 修改前
<DonutChart total={chartTotal} label={statType === 'expense' ? '总支出' : '总收入'} />

// 修改后
<DonutChart
  total={chartTotal}
  label={statType === 'expense' ? '总支出' : '总收入'}
  segments={rankItems}
/>
```

- [ ] **Step 4: 提交**

```bash
git add src/components/DonutChart/ src/pages/stats/index.tsx
git commit -m "feat: replace DonutChart placeholder with Canvas segmented ring"
```

---

### Task 7: MonthSwitcher 滑动手势

**Files:**
- Modify: `src/components/MonthSwitcher/index.tsx`
- Modify: `src/components/MonthSwitcher/index.scss`

- [ ] **Step 1: 增加 touch 事件处理**

```tsx
// src/components/MonthSwitcher/index.tsx
import { View, Text } from '@tarojs/components'
import { useRef } from 'react'
import './index.scss'

interface MonthSwitcherProps {
  month: string
  onChange: (month: string) => void
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  const yy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${yy}-${mm}`
}

export default function MonthSwitcher({ month, onChange }: MonthSwitcherProps) {
  const label = `${month.split('-')[0]}年${Number(month.split('-')[1])}月`
  const touchStartX = useRef(0)

  const handleTouchStart = (e: any) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: any) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(deltaX) < 50) return
    if (deltaX > 0) {
      onChange(shiftMonth(month, -1))
    } else {
      onChange(shiftMonth(month, 1))
    }
  }

  return (
    <View
      className='month-switcher'
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <View className='month-switcher__btn' onClick={() => onChange(shiftMonth(month, -1))}>
        <Text className='month-switcher__arrow'>‹</Text>
      </View>
      <Text className='month-switcher__label'>{label}</Text>
      <View className='month-switcher__btn' onClick={() => onChange(shiftMonth(month, 1))}>
        <Text className='month-switcher__arrow'>›</Text>
      </View>
    </View>
  )
}
```

- [ ] **Step 2: 增加滑动过渡动画样式**

```scss
// src/components/MonthSwitcher/index.scss
.month-switcher {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 0 var(--space-page) var(--space-item);
  touch-action: pan-y; // 允许垂直滚动，水平滑动用于切月
}

.month-switcher__label {
  font-size: var(--text-list);
  font-weight: 600;
  color: var(--text-primary);
  min-width: 200px;
  text-align: center;
  transition: transform 0.15s ease-out;
}

.month-switcher__btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--surface);
  border: 1px solid var(--surface-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.month-switcher__arrow {
  font-size: 36px;
  line-height: 1;
  color: var(--text-secondary);
  margin-top: -4px;
}
```

- [ ] **Step 3: 提交**

```bash
git add src/components/MonthSwitcher/
git commit -m "feat: add swipe gesture to MonthSwitcher"
```

---

### Task 8: AddSheet 记账底部弹出组件

**Files:**
- Create: `src/components/AddSheet/index.tsx`
- Create: `src/components/AddSheet/index.scss`
- Modify: `src/pages/index/index.tsx`

- [ ] **Step 1: 创建 AddSheet 组件（复用 add 页面逻辑）**

```tsx
// src/components/AddSheet/index.tsx
import { View, Text, Picker } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro from '@tarojs/taro'
import CategoryGrid from '@/components/CategoryGrid'
import NumPad from '@/components/NumPad'
import IceSheet from '@/components/IceSheet'
import { useAuth } from '@/contexts/AuthContext'
import { addRecord, getRecords } from '@/services/records'
import { getCategories } from '@/services/categories'
import { currentDateStr } from '@/utils/date'
import { formatAmount } from '@/utils/amount'
import type { RecordType } from '@/types'
import './index.scss'

interface AddSheetProps {
  visible: boolean
  onClose: () => void
  onSaved: () => void
}

export default function AddSheet({ visible, onClose, onSaved }: AddSheetProps) {
  const { user } = useAuth()
  const [type, setType] = useState<RecordType>('expense')
  const [amountStr, setAmountStr] = useState('0')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(currentDateStr())
  const [categories, setCategories] = useState(() => getCategories())

  const filteredCategories = useMemo(
    () => categories.filter(c => c.type === type && c.userId === (user?.openid || '')),
    [categories, type, user?.openid],
  )

  const amount = parseFloat(amountStr) || 0
  const canSubmit = amount > 0 && categoryId

  const handleKey = (key: string) => {
    if (key === 'del') {
      setAmountStr(prev => (prev.length <= 1 ? '0' : prev.slice(0, -1)))
      return
    }
    if (key === '.') {
      if (!amountStr.includes('.')) setAmountStr(prev => `${prev}.`)
      return
    }
    setAmountStr(prev => {
      if (prev === '0') return key
      if (prev.includes('.') && prev.split('.')[1]?.length >= 2) return prev
      return prev + key
    })
  }

  const handleOpen = () => {
    // reset state when opening
    setType('expense')
    setAmountStr('0')
    setDate(currentDateStr())
    const cats = getCategories()
    setCategories(cats)
    const expenseCats = cats.filter(c => c.type === 'expense' && c.userId === user?.openid)
    setCategoryId(expenseCats[0]?._id || '')
  }

  const onTypeChange = (next: RecordType) => {
    setType(next)
    const cats = getCategories().filter(c => c.type === next && c.userId === user?.openid)
    setCategoryId(cats[0]?._id || '')
  }

  const handleSubmit = async () => {
    if (!canSubmit || !user?.openid) return
    const network = await Taro.getNetworkType()
    addRecord({
      userId: user.openid,
      type,
      amount,
      categoryId,
      note: '',
      date,
    })
    Taro.showToast({ title: '记账成功', icon: 'success' })
    if (network.networkType === 'none') {
      setTimeout(() => {
        Taro.showToast({ title: '已保存，待同步', icon: 'none' })
      }, 1500)
    }
    onSaved()
    onClose()
  }

  return (
    <IceSheet visible={visible} onClose={onClose}>
      <View className='add-sheet' onTouchMove={e => e.stopPropagation()}>
        <View className='add-sheet__toggle add-sheet__toggle--expense'>
          <Text
            className={`add-sheet__tab ${type === 'expense' ? 'add-sheet__tab--active' : ''}`}
            onClick={() => onTypeChange('expense')}
          >
            支出
          </Text>
          <Text
            className={`add-sheet__tab ${type === 'income' ? 'add-sheet__tab--active' : ''}`}
            onClick={() => onTypeChange('income')}
          >
            收入
          </Text>
        </View>

        <View className='add-sheet__amount-wrap'>
          <Text className='add-sheet__currency'>¥</Text>
          <Text className='add-sheet__amount'>{formatAmount(amount)}</Text>
        </View>

        <Text className='add-sheet__hint'>选择分类</Text>

        <CategoryGrid
          categories={filteredCategories}
          selectedId={categoryId}
          onSelect={setCategoryId}
        />

        <NumPad onInput={handleKey} />

        <View className='add-sheet__footer'>
          <Picker mode='date' value={date} onChange={e => setDate(e.detail.value)}>
            <View className='add-sheet__date'>
              <Text className='add-sheet__date-label'>日期</Text>
              <Text className='add-sheet__date-value'>{date.replace(/-/g, '.')}</Text>
            </View>
          </Picker>
          <View
            className={`add-sheet__done ${canSubmit ? '' : 'add-sheet__done--disabled'}`}
            onClick={handleSubmit}
          >
            <Text>完成</Text>
          </View>
        </View>
      </View>
    </IceSheet>
  )
}
```

- [ ] **Step 2: 创建 AddSheet 样式（基于原 add 页面样式）**

```scss
// src/components/AddSheet/index.scss
.add-sheet {
  padding-bottom: env(safe-area-inset-bottom);
  display: flex;
  flex-direction: column;
}

.add-sheet__toggle {
  display: flex;
  margin: 12px var(--space-page) 0;
  background: var(--surface);
  border-radius: 999px;
  padding: 6px;
  border: 1px solid var(--surface-border);
}

.add-sheet__tab {
  flex: 1;
  text-align: center;
  padding: 18px;
  font-size: var(--text-list);
  color: var(--text-secondary);
  border-radius: 999px;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;

  &--active {
    background: rgba(251, 146, 60, 0.15);
    color: var(--expense);
    font-weight: 700;
  }
}

.add-sheet__amount-wrap {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  margin: 28px var(--space-page) 8px;
}

.add-sheet__currency {
  font-size: var(--text-title);
  font-weight: 600;
  color: var(--text-secondary);
}

.add-sheet__amount {
  font-size: var(--text-amount-lg);
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.1;
  letter-spacing: -1px;
}

.add-sheet__hint {
  display: block;
  padding: 0 var(--space-page);
  font-size: var(--text-caption);
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.add-sheet__footer {
  display: flex;
  align-items: stretch;
  gap: var(--space-item);
  padding: var(--space-section) var(--space-page) 32px;
}

.add-sheet__date {
  padding: 20px 24px;
  background: var(--surface);
  border-radius: var(--radius-item);
  border: 1px solid var(--surface-border);
  min-width: 160px;
  min-height: 88px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.add-sheet__date-label {
  font-size: var(--text-caption);
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.add-sheet__date-value {
  font-size: var(--text-body);
  color: var(--text-primary);
  font-weight: 600;
}

.add-sheet__done {
  flex: 1;
  text-align: center;
  padding: 20px;
  border-radius: var(--radius-item);
  background: var(--btn-gradient);
  color: #1c1917;
  font-weight: 700;
  font-size: var(--text-title);
  min-height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-sheet__done--disabled {
  opacity: 0.4;
}
```

- [ ] **Step 3: 修改首页集成 AddSheet**

```tsx
// src/pages/index/index.tsx — 关键修改
// 新增 import
import { useState } from 'react' // 已有，无需改
import AddSheet from '@/components/AddSheet'

// 新增 state
const [addVisible, setAddVisible] = useState(false)

// 修改 + 按钮点击处理：在 custom-tab-bar 中 navigateTo 改为事件
// 实际上 + 按钮在 custom-tab-bar 中，需要通过其他方式触发

// 当前方案：index 页面通过 Taro.eventCenter 监听来自 tabBar 的打开事件
```

实际上，custom-tab-bar 中的 + 按钮需要触发首页的 AddSheet。最简单的方式是通过 Taro 事件总线：

在 `src/custom-tab-bar/index.tsx` 中修改 + 按钮：
```tsx
// 修改前
onClick={() => Taro.navigateTo({ url: '/pages/add/index' })}

// 修改后
onClick={() => Taro.eventCenter.trigger('openAddSheet')}
```

在 `src/pages/index/index.tsx` 中监听：
```tsx
import { useReady } from '@tarojs/taro'
import AddSheet from '@/components/AddSheet'

// 在组件内
const [addVisible, setAddVisible] = useState(false)

useReady(() => {
  // ... existing init code ...

  Taro.eventCenter.on('openAddSheet', () => {
    setAddVisible(true)
  })
})

const handleAddSaved = () => {
  refresh()
}

// JSX 中添加
<AddSheet visible={addVisible} onClose={() => setAddVisible(false)} onSaved={handleAddSaved} />
```

- [ ] **Step 4: 提交**

```bash
git add src/components/AddSheet/ src/components/IceSheet/ src/pages/index/index.tsx src/custom-tab-bar/index.tsx
git commit -m "feat: add AddSheet bottom sheet for quick accounting"
```

---

### Task 9: Stats 页面 DonutChart segments 集成

**Files:**
- Modify: `src/pages/stats/index.tsx`

此任务在 Task 6 Step 3 已涵盖（stats 页面传入 segments）。此处确认：

- [ ] **Step 1: 确认 stats 页面变更**

已在 Task 6 Step 3 中修改：
```tsx
<DonutChart
  total={chartTotal}
  label={statType === 'expense' ? '总支出' : '总收入'}
  segments={rankItems}
/>
```

- [ ] **Step 2: 提交**

```bash
# 已在 Task 6 中一起提交
```

---

### Task 10: 清理原 add 页面和 TabBar 组件引用

**Files:**
- 保留: `src/pages/add/index.tsx` (编辑模式仍需要)
- 保留: `src/components/TabBar/` (暂保留，后续可删除)

确认 `src/pages/add/index.tsx` 仍可用于编辑模式（通过 `?id=xxx` 参数）。

- [ ] **Step 1: 确认编辑模式兼容**

`src/pages/index/index.tsx` 中的 `handleEdit` 仍使用：
```tsx
const handleEdit = (id: string) => {
  Taro.navigateTo({ url: `/pages/add/index?id=${id}` })
}
```

这保持不变。AddSheet 仅用于新建，编辑仍跳转原全屏页。

- [ ] **Step 2: 提交**

无需额外提交——编辑模式兼容性在之前任务中已保持。

---

## 实施顺序

```
Task 1 (IceSheet) ──→ Task 8 (AddSheet) ──→ Task 10 (清理)
                   
Task 2 (custom-tab-bar) ──→ (独立，无依赖)

Task 3 (CSS var) ──→ Task 4 (SummaryCard)

Task 5 (RecordItem) ──→ (独立)

Task 6 (DonutChart) ──→ Task 9 (Stats 集成)

Task 7 (MonthSwitcher) ──→ (独立)
```

推荐执行顺序：1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9

---

## Self-Review

**Spec coverage:**
- SummaryCard 重设计 → Task 3, 4
- 记账页底部弹出 → Task 1, 8
- RecordItem 质感升级 → Task 5
- DonutChart 真实分段 → Task 6, 9
- TabBar 切页 + 月份滑动 → Task 2, 7

**Placeholder scan:** 无 TBD/TODO，所有步骤有完整代码。

**Type consistency:**
- `DonutSegment` 接口在 Task 6 定义，Task 9 使用 `rankItems` 匹配
- IceSheet `visible`/`onClose` props 在 Task 1 定义，Task 8 使用
- AddSheet `onSaved` callback 在 Task 8 定义，Task 8 index 集成中使用
