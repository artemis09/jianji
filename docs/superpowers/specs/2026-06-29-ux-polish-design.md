ji'x# 简记 UI/UX 优化设计规格（第三轮）

> 参考鲨鱼记账/随手记 · 优化设计定稿 · 2026-06-29

## 1. 概述

在现有功能基础上，从三个方向进行 UI/UX 优化：

| 方向 | 内容 | 优先级 |
|------|------|--------|
| 方向一 | 记账体验升级 | P0 — 核心高频路径优化 |
| 方向二 | 统计与洞察 | P1 — 新增统计能力 |
| 方向三 | UI 精致化 | P1 — 视觉质感提升 |

### 实现顺序

方向一 → 方向三 → 方向二

---

## 2. 方向一：记账体验升级

### 2.1 展开式备注输入

**位置：** 分类宫格与数字键盘之间

```
┌────────────────────────────┐
│  选择分类                  │  ← 标题
│  [🍜] [🚇] [🛒] [🏠] ...  │  ← 分类宫格
│  [添加备注…]              │  ← 折叠态，点击展开
│  ┌──────────────────────┐  │
│  │ 今天午饭              │  │  ← 展开态，输入框
│  └──────────────────────┘  │
│  [1] [2] [3]              │  ← 数字键盘
│  [4] [5] [6]              │
│  [7] [8] [9]              │
│  [.] [0] [⌫]              │
│  日期: 2026.06.29    完成   │
└────────────────────────────┘
```

**实现细节：**
- AddSheet 新增 `note` state，默认空字符串
- 分类宫格下方渲染备注区域：
  - 折叠态：浅色 `--text-secondary` 占位文字「添加备注…」，圆形背景底
  - 展开态：`<Textarea>` 组件，自动聚焦，placeholder「记录一下…」
  - 点击空白区 / 完成 → 自动收起（内容保留在 state 中）
- 提交时 `note` 字段随 payload 一起写入
- 编辑模式下已有备注内容自动展开

**文件变更：**
| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/AddSheet/index.tsx` | 新增 state + 渲染 | 备注区域 UI |
| `src/components/AddSheet/index.scss` | 新增样式 | 备注折叠/展开动画 |

### 2.2 左滑删除

**交互：**
- 当前：`onLongPress` → 弹窗确认 → 删除
- 改为：左滑露出红色删除按钮 → 点击删除 → 弹窗确认
- 右滑 / 点击其他记录 → 复位

**实现细节：**
- RecordItem 包裹 `SwipeableRow` 或直接用 `touch` 事件 + `transform: translateX`
- 删除按钮固定宽度 160px，红色背景 + 白色文字「删除」
- 一次只允许一个记录处于左滑状态（全局复位逻辑）
- 保留长按删除作为备选（无障碍方案）

**文件变更：**
| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/RecordItem/index.tsx` | 重写 | 左滑手势 + 删除按钮 |
| `src/components/RecordItem/index.scss` | 重写 | 删除按钮样式 + 滑动动画 |

### 2.3 触感反馈

**位置：** 数字键盘按键

```ts
// NumPad key onClick
const handleKey = (key: string) => {
  try { Taro.vibrateShort({ type: 'light' }) } catch {}
  onInput(key)
}
```

- 仅在支持震动的设备生效，静音/低电量不会干扰
- 使用 `Taro.vibrateShort`（`type: 'light'`），API 自 2018 年稳定

**文件变更：**
| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/NumPad/index.tsx` | 修改 | 按键增加震动 |

### 2.4 连续记账

**行为：**
- 点击「完成」后不清除所有状态，而是：
  - 金额重置为 `0`
  - 分类重置为该类型的第一个分类
  - 日期重置为当天
  - 备注重置为空
  - toast「记账成功」后保留在当前页
- 编辑场景（`editId`）保持原行为：编辑完返回
- 退出记账页：点击遮罩 / 取消按钮关闭

**文件变更：**
| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/AddSheet/index.tsx` | 修改 | submit 后重置而非返回 |

---

## 3. 方向三：UI 精致化

### 3.1 TabBar switchTab + 月份滑动手势

**TabBar：**
- `app.config.ts`：将 `pages/index/index` 和 `pages/stats/index` 注册为 tabBar
- TabBar 组件中 `redirectTo` 改为 `switchTab`
- 利用原生 tab 切换消除页面闪烁，自动记忆页面状态

**MonthSwitcher：**
- 增加 `onTouchStart` / `onTouchEnd` 事件监听
- 水平滑动阈值 > 50px 触发切换
- 左滑 → 下个月，右滑 → 上个月
- 手势期间 `transition: transform 200ms ease-out` 实现位移反馈

**文件变更：**
| 文件 | 操作 | 说明 |
|------|------|------|
| `src/app.config.ts` | 修改 | 注册 tabBar |
| `src/components/TabBar/index.tsx` | 修改 | switchTab 替代 redirectTo |
| `src/components/MonthSwitcher/index.tsx` | 修改 | 增加滑动手势 |
| `src/components/MonthSwitcher/index.scss` | 修改 | 滑动动画 |

### 3.2 RecordItem 显示时间

**布局变更：**

```
当前：
(icon)  餐饮         -32.50
        [餐饮]

改为：
(icon)  午餐          -32.50
        餐饮 · 12:30
```

- 主行：备注优先显示，无备注时显示分类名（现行逻辑不变）
- 副行：分类名 + `·` + 时间（HH:mm），从 `record.createdAt` 提取
- 无 createdAt 时只显示分类名

**文件变更：**
| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/RecordItem/index.tsx` | 修改 | 副行时间渲染 |
| `src/components/RecordItem/index.scss` | 修改 | 副行样式 |

### 3.3 DonutChart Canvas 分段绘制

**当前：** CSS 渐变实心圆环，不展示真实数据分布。

**改为：** Canvas 2D 绘制按分类分段的环形图。

**Props：**
```ts
interface DonutChartProps {
  total: number
  label: string
  segments?: Array<{
    name: string
    amount: number
    percent: number
    color: string
  }>
}
```

**绘制逻辑：**
1. 从 12 点钟方向起，顺时针按 percent 分配弧长
2. 每段弧用对应 color 填充（`ctx.fillStyle = color`）
3. 内径 72px，外径 140px（基于 280px 画布）
4. 中心孔洞显示总金额 + 标签
5. 无数据时：`setLineDash` 虚线圆环 + 中心「暂无数据」
6. 无 segments 时：纯色整圆（fallback 兼容现有用法）

**Stats 页面：** 将 `breakdown` 数据作为 segments 传入。

**文件变更：**
| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/DonutChart/index.tsx` | 重写 | Canvas 绘制 |
| `src/components/DonutChart/index.scss` | 修改 | Canvas 容器样式 |
| `src/pages/stats/index.tsx` | 修改 | 传入 segments 数据 |

---

## 4. 方向二：统计与洞察

### 4.1 月度趋势折线图

**位置：** 统计页芯片行下方，SegToggle 上方

```
┌──────────────────────────────────┐
│  收入 ¥8,500  支出 ¥3,200       │  ← 芯片行
│           较上月 ↓12%  ↑5%       │
│  ┌──────────────────────────────┐│
│  │       每日支出趋势            ││  ← 折线图（echarts）
│  │   ▁▃▆▅▄█▅▄▃▂▂▃▅▇▆▅▄▃▂▁    ││
│  └──────────────────────────────┘│
│  支出 │ 收入                      │  ← SegToggle
│  ┌──────────────────────────────┐│
│  │      (环形图)                 ││
│  └──────────────────────────────┘│
└──────────────────────────────────┘
```

**实现：**
- 使用 `echarts-for-weixin`（已存在依赖）
- 新建 `src/components/TrendChart/index.tsx`
- 数据源：从 records 按日期聚合每日金额
- Props：`data: Array<{date: string, amount: number}>` + `type: 'expense' | 'income'`
- 默认显示当月支出折线，切换 SegToggle 到收入时显示收入折线
- 月份切换自动更新

**文件变更：**
| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/TrendChart/index.tsx` | 新建 | 折线图组件 |
| `src/components/TrendChart/index.scss` | 新建 | 容器样式 |
| `src/pages/stats/index.tsx` | 修改 | 集成 TrendChart |
| `src/utils/stats.ts` | 修改 | 新增每日聚合函数 |

### 4.2 上月对比

**位置：** 统计页芯片行，收入/支出数值下方

```
┌────────────┐  ┌────────────┐  ┌────────────┐
│ 收入       │  │ 支出       │  │ 结余       │
│ ¥8,500     │  │ ¥3,200     │  │ ¥5,300     │
│ ↑5.2%     │  │ ↓12.8%    │  │ ↑18.0%    │
└────────────┘  └────────────┘  └────────────┘
```

- 上箭头绿色 `↑`：收入增加/支出减少/结余增加（利好）
- 下箭头红色 `↓`：收入减少/支出增加/结余减少（不利）
- 百分比显示绝对值
- `calcMonthSummary` 扩展返回上月的收入/支出

### 4.3 月度预算

**数据模型（新增）：**
```ts
// src/types/index.ts
export interface Budget {
  _id: string
  userId: string
  month: string       // "2026-06"
  amount: number      // 预算总额
}
```

**UI 改动：**

| 位置 | 内容 |
|------|------|
| **首页汇总卡片** | 当月有预算时，结余下方显示进度条：`支出 / 预算金额`。超过 90% 变红，超支显示「已超支 ¥XXX」 |
| **统计页芯片行** | 第三块从「结余」改为预算信息：「预算 ¥5,000 剩余 ¥2,300」 |
| **我的页** | 新增「预算设置」菜单项 |

**预算设置：**
- 新增子页 `/pages/budget/index`（或简单的 Modal 表单）
- Picker 选择月份 + Input 输入金额
- 保存到本地 storage
- 不设预算则所有预算 UI 隐藏

**预算不存在时的行为：**
- 进度条和超支提醒不显示
- 不影响正常记账
- 统计页芯片恢复显示「结余」

**文件变更：**
| 文件 | 操作 | 说明 |
|------|------|------|
| `src/types/index.ts` | 修改 | 新增 Budget 类型 |
| `src/services/budget.ts` | 新建 | budget CRUD 服务 |
| `src/pages/budget/index.tsx` | 新建 | 预算设置页 |
| `src/pages/budget/index.scss` | 新建 | 预算设置样式 |
| `src/pages/profile/index.tsx` | 修改 | 新增预算菜单项 |
| `src/pages/index/index.tsx` | 修改 | 预算进度条 |
| `src/components/SummaryCard/index.tsx` | 修改 | 预算进度条 |
| `src/components/SummaryCard/index.scss` | 修改 | 进度条样式 |
| `src/pages/stats/index.tsx` | 修改 | 预算信息芯片 |

---

## 5. 文件变更总清单

| 文件 | 操作 | 方向 |
|------|------|------|
| `src/types/index.ts` | 修改 | 二 |
| `src/app.config.ts` | 修改 | 三 |
| `src/components/AddSheet/index.tsx` | 修改 | 一 |
| `src/components/AddSheet/index.scss` | 修改 | 一 |
| `src/components/RecordItem/index.tsx` | 重写 | 一、三 |
| `src/components/RecordItem/index.scss` | 重写 | 一、三 |
| `src/components/NumPad/index.tsx` | 修改 | 一 |
| `src/components/TabBar/index.tsx` | 修改 | 三 |
| `src/components/MonthSwitcher/index.tsx` | 修改 | 三 |
| `src/components/MonthSwitcher/index.scss` | 修改 | 三 |
| `src/components/DonutChart/index.tsx` | 重写 | 三 |
| `src/components/DonutChart/index.scss` | 修改 | 三 |
| `src/components/TrendChart/index.tsx` | 新建 | 二 |
| `src/components/TrendChart/index.scss` | 新建 | 二 |
| `src/components/SummaryCard/index.tsx` | 修改 | 二 |
| `src/components/SummaryCard/index.scss` | 修改 | 二 |
| `src/pages/index/index.tsx` | 修改 | 二 |
| `src/pages/stats/index.tsx` | 修改 | 二、三 |
| `src/pages/profile/index.tsx` | 修改 | 二 |
| `src/pages/budget/index.tsx` | 新建 | 二 |
| `src/pages/budget/index.scss` | 新建 | 二 |
| `src/services/budget.ts` | 新建 | 二 |
| `src/utils/stats.ts` | 修改 | 二 |

---

## 6. 风险与约束

- **switchTab 限制**：tabBar 页面需在 `app.config.ts` 注册，注册路径必须一致
- **Canvas 兼容性**：Taro Canvas type="2d" 需基础库 2.9+，覆盖绝大部分微信用户
- **echarts-for-weixin** 包体积较大（~500KB），注意小程序包体积控制
- **左滑手势** 可能与页面滚动冲突，需处理好 touch 事件的 preventDefault
- **预算数据** 仅本地存储，V1 不涉及云端同步
