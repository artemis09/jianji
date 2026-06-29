# 简记 UI 优化设计规格

> 参考鲨鱼记账 / 随手记 · 设计定稿 · 2026-06-29

## 1. 概述

### 1.1 目标

在现有功能基础上优化 UI，参考鲨鱼记账和随手记的精致感：强化信息层级、增强卡片质感、提升交互流畅度。

### 1.2 优化范围

方案 B — 核心页面重构，5 个模块：

| 模块 | 现状 | 目标 |
|------|------|------|
| SummaryCard | 结余数字不够醒目，收支用竖线分隔 | 更大金额 + 双卡片并排 + 层次加强 |
| 记账页 | 全屏 navigateTo 跳转 | 底部弹窗式，不离当前页 |
| RecordItem | 平卡片，无时间信息 | 左侧色条 + 时间显示 + 质感升级 |
| DonutChart | 渐变实心圆环占位 | Canvas 绘制真实分类分段 |
| TabBar + 月份 | redirectTo 闪烁 + 只能点击箭头 | switchTab + 手势滑动 |

### 1.3 不做

- 全局微动效系统（保留 V2）
- 分类宫格拖拽排序（保留 V2）
- 统计页趋势折线图（保留 V2）
- 下拉刷新/上拉加载（保留 V2）

---

## 2. 模块设计

### 2.1 SummaryCard 重设计

**信息层级重构：**

```
┌──────────────────────────────────────┐
│                                      │
│       本月结余 (元)                    │
│         ¥ 12,380.50                  │  ← 72px 渐变文字
│                                      │
│  ┌────────────┐  ┌────────────┐      │
│  │ ▌ 收入     │  │ ▌ 支出     │      │  ← 双卡片并排，左侧色条
│  │  ¥8,500    │  │  ¥3,200    │      │
│  └────────────┘  └────────────┘      │
│                                      │
└──────────────────────────────────────┘
```

改动点：
- 结余字号 `--text-balance` 从 56px → 72px，新增 CSS 变量 `--text-balance-lg: 72px`
- 收支从 `border-top` 分隔文字行 → 两个独立小卡片，各带 4px 宽左侧色条（绿/橙）
- warm 主题外层 glow 保持，`.summary-card--warm` padding 从 2px → 3px
- 间距：结余区 margin-bottom 从 24px → 32px

### 2.2 记账页改为底部弹出

**交互流程：**

1. 点击 TabBar + → 在当前页渲染弹出层，不从页面栈 push
2. 弹出层从底部 `translateY(100%) → 0`，300ms ease-out
3. 背景半透明遮罩 `rgba(0,0,0,0.5)`，点击遮罩关闭（金额为空时）
4. 完成记账 → 弹出层滑出 → toast → 刷新首页数据

**结构：**

```
<IceSheet visible={show} onClose={}>
  <TypeToggle />
  <AmountDisplay />
  <CategoryGrid />
  <NumPad />
  <Footer date + done />
</IceSheet>
```

改动点：
- 新建 `src/components/IceSheet/` 通用底部弹出组件（动画 + 遮罩）
- 记账页面逻辑从 `/pages/add/index` 移到组件 `AddSheet`（放在 `src/components/` 下）
- 首页 `index.tsx` 引入 `AddSheet`，用 state 控制显隐
- `/pages/add/index` 保留兼容编辑模式的路由入口
- 编辑记录场景：仍通过 navigateTo 跳转 add 页面（带 id 参数）

### 2.3 RecordItem 质感升级

**布局变更：**

```
当前：
┌──────────────────────────────────┐
│ (icon)  餐饮         -32.50     │
│         [餐饮]                   │
└──────────────────────────────────┘

改为：
┌──────────────────────────────────┐
│ ▌ (icon)  午餐          -32.50  │
│ ▌         餐饮 · 12:30          │
└──────────────────────────────────┘
```

改动点：
- 左侧 3px 分类色条（`border-left` 或伪元素），颜色由 `getCategoryColor()` 决定
- 标题行：备注/分类名，字重 500；金额右对齐 700
- 副行：分类名纯文字 + `·` + 时间（HH:mm），从 `record.createdAt` 提取时分。若无 createdAt 则只显示分类名
- 卡片圆角 16px → 14px，项间距 12px → 10px

### 2.4 DonutChart 真实数据分段

**当前状态：** 纯 CSS 渐变实心圆环 + 中心文字，无数据绑定。

**改为 Canvas 绘制：**

- 使用 Taro `<Canvas>` 组件，type="2d"
- Props 扩展：传入 `segments: Array<{name, amount, percent, color}>`
- 绘制逻辑：
  1. 从 12 点钟方向起，顺时针按 percent 分配弧长
  2. 每段弧用对应 color 填充
  3. 圆环内径 72px，外径 140px（基于 280px 画布）
  4. 中心孔洞显示总金额 + 标签
- 无数据时：绘制虚线圆环（`setLineDash`）+ 中心 "暂无数据"
- 在 stats 页面将 `breakdown` 数据传入

### 2.5 TabBar 切页 + 月份滑动

**TabBar 切页动画：**
- `app.config.ts`：将 `pages/index/index` 和 `pages/stats/index` 注册为 tabBar
- TabBar 组件：`Taro.redirectTo` → `Taro.switchTab`
- 好处：利用小程序原生 tab 切换（无闪烁），自动记忆页面状态

**月份滑动切换：**
- MonthSwitcher 增加 `onTouchStart` / `onTouchEnd` 事件
- 滑动阈值 > 50px 触发切换
- 左滑 → 下个月，右滑 → 上个月
- CSS `transition: transform 200ms ease-out` 实现平移动画
- 保留左右箭头点击

---

## 3. 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/IceSheet/index.tsx` | 新建 | 通用底部弹出组件 |
| `src/components/IceSheet/index.scss` | 新建 | 弹出动画样式 |
| `src/components/AddSheet/index.tsx` | 新建 | 记账弹出内容 |
| `src/components/AddSheet/index.scss` | 新建 | 复用原 add 页样式 |
| `src/components/SummaryCard/index.tsx` | 修改 | 双卡片布局 |
| `src/components/SummaryCard/index.scss` | 修改 | 新布局样式 |
| `src/components/RecordItem/index.tsx` | 修改 | 左侧色条 + 时间 |
| `src/components/RecordItem/index.scss` | 修改 | 新布局样式 |
| `src/components/DonutChart/index.tsx` | 修改 | Canvas 分段绘制 |
| `src/components/DonutChart/index.scss` | 修改 | Canvas 容器样式 |
| `src/components/MonthSwitcher/index.tsx` | 修改 | 增加滑动手势 |
| `src/components/MonthSwitcher/index.scss` | 修改 | 滑动动画 |
| `src/components/TabBar/index.tsx` | 修改 | redirectTo → switchTab |
| `src/pages/index/index.tsx` | 修改 | 集成 AddSheet |
| `src/pages/stats/index.tsx` | 修改 | 传入 breakdown 给 DonutChart |
| `src/app.config.ts` | 修改 | 注册 tabBar |
| `src/app.scss` | 修改 | 新增 --text-balance-lg 变量 |

---

## 4. 风险与约束

- **switchTab 限制**：tabBar 页面不能用 `navigateTo` 传参，需改用全局状态或 storage 传递数据
- **Canvas 兼容性**：Taro Canvas type="2d" 需基础库 2.9+，覆盖绝大部分用户
- **IceSheet 动画**：小程序 `Animation` API 性能优于 CSS transition，优先使用 `Taro.createAnimation`
- **编辑模式**：AddSheet 支持编辑模式（传入 record prop），或保留原 add 页面路由

---

## 5. 需要做

- 分类宫格拖拽排序
- 全局页面过渡动效系统
- 统计页趋势折线图
- 下拉刷新 / 上拉加载
- 记账备注输入框（保持选填，不在此次范围）
