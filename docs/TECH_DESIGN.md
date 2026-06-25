# 简记（JianJi）技术设计文档

> 版本：v1.0 | 日期：2026-06-25 | 关联 PRD：[2026-06-25-jianji-design.md](./2026-06-25-jianji-design.md)

---

## 1. 技术栈选型

### 1.1 总览

| 层级 | 选型 | 版本要求 | 选型理由 |
|------|------|----------|----------|
| 平台 | 微信小程序 | 基础库 ≥ 2.25 | 用户选定，小程序用户触达成本最低 |
| 框架 | Taro 4 + React | Taro ≥ 4.0, React 18 | 组件化、类型安全、可跨端复用 |
| 语言 | TypeScript | ≥ 5.0 | 编译期类型检查，减少运行时错误 |
| 构建 | Webpack 5（Taro 内置） | - | 零配置，开箱即用 |
| 样式 | SCSS + CSS Modules | - | 嵌套语法 + 样式隔离 |
| 云端 | 微信云开发 | - | 免运维，数据库 + 云函数 + 存储一体化 |
| 云函数 | Node.js 18 | - | 云开发默认运行时 |
| 图表 | echarts-for-weixin | 最新版 | 环形图、进度条，小程序适配 |
| 状态管理 | React Context + useReducer | - | 轻量，无需引入 Redux/MobX |
| 主题 | CSS 变量 + Context | - | 5 套主题即时切换，零运行时开销 |
| UI 组件 | 自研 + Taro 内置 | - | 设计稿定制化程度高，不引入第三方组件库 |

### 1.2 为什么不用原生开发

| 维度 | Taro | 原生 |
|------|------|------|
| 组件化 | React 生态，天然组件化 | 需手动管理 Component |
| 类型安全 | TypeScript 深度支持 | 支持，但体验不如 Taro |
| 开发体验 | HMR、React DevTools | 微信开发者工具调试 |
| 未来扩展 | 一套代码可编译 H5/支付宝 | 仅限微信 |

### 1.3 云开发服务选型

| 服务 | 用途 | 说明 |
|------|------|------|
| 云数据库（文档型） | 存储 records、categories、users | JSON 文档模型，schema-free |
| 云函数 | 统计聚合、登录解密、预设分类初始化 | 服务端逻辑 |
| 云存储 | 不直接使用 | V1 无图片/文件存储需求 |
| 云调用 | 获取 openid、手机号解密 | 免鉴权调用微信开放接口 |

---

## 2. 项目结构

```
jianji/
├── client/                         # Taro 小程序前端
│   ├── config/                     # Taro 编译配置
│   │   ├── index.ts                # 主配置
│   │   ├── dev.ts                  # 开发环境
│   │   └── prod.ts                 # 生产环境
│   ├── src/
│   │   ├── app.tsx                 # 应用入口
│   │   ├── app.config.ts           # 全局配置（路由、tabBar、窗口）
│   │   ├── app.scss                # 全局样式 + CSS 变量 + 主题定义
│   │   ├── pages/                  # 页面目录
│   │   │   ├── index/              # 明细页（首页 Tab）
│   │   │   │   ├── index.tsx
│   │   │   │   ├── index.config.ts
│   │   │   │   ├── index.module.scss
│   │   │   │   └── components/     # 页面级组件
│   │   │   │       ├── MonthSummary/      # 月度汇总卡片
│   │   │   │       ├── RecordList/        # 日期分组列表
│   │   │   │       └── RecordItem/        # 单条记录行
│   │   │   ├── add/                # 记账页（全屏）
│   │   │   │   ├── index.tsx
│   │   │   │   ├── index.config.ts
│   │   │   │   ├── index.module.scss
│   │   │   │   └── components/
│   │   │   │       ├── NumberKeyboard/    # 自定义数字键盘
│   │   │   │       ├── CategoryGrid/      # 分类宫格选择
│   │   │   │       └── TypeToggle/        # 收支类型切换
│   │   │   ├── stats/              # 统计页（统计 Tab）
│   │   │   │   ├── index.tsx
│   │   │   │   ├── index.config.ts
│   │   │   │   ├── index.module.scss
│   │   │   │   └── components/
│   │   │   │       ├── RingChart/         # 环形图封装
│   │   │   │       └── CategoryRank/      # 分类排行榜
│   │   │   ├── mine/               # 我的（子页面）
│   │   │   │   ├── index.tsx
│   │   │   │   └── index.config.ts
│   │   │   ├── detail/             # 记录详情 / 编辑
│   │   │   │   ├── index.tsx
│   │   │   │   └── index.config.ts
│   │   │   ├── categories/         # 分类管理
│   │   │   │   ├── index.tsx
│   │   │   │   ├── index.config.ts
│   │   │   │   └── components/
│   │   │   │       └── CategoryItem/      # 可拖拽分类行
│   │   │   ├── theme/              # 主题选择
│   │   │   │   ├── index.tsx
│   │   │   │   └── index.config.ts
│   │   │   └── login/              # 登录授权
│   │   │       ├── index.tsx
│   │   │       └── index.config.ts
│   │   ├── components/             # 全局共享组件
│   │   │   ├── Skeleton/           # 骨架屏
│   │   │   ├── EmptyState/         # 空状态占位
│   │   │   └── IconButton/         # 图标按钮
│   │   ├── services/               # 业务逻辑层
│   │   │   ├── record.ts           # 记账 CRUD
│   │   │   ├── category.ts         # 分类管理
│   │   │   ├── user.ts             # 用户信息
│   │   │   ├── stats.ts            # 统计查询（聚合）
│   │   │   └── sync.ts             # 离线同步引擎
│   │   ├── store/                  # 全局状态
│   │   │   ├── RecordContext.tsx   # 记录数据上下文
│   │   │   ├── CategoryContext.tsx # 分类数据上下文
│   │   │   └── ThemeContext.tsx    # 主题上下文
│   │   ├── hooks/                  # 自定义 Hooks
│   │   │   ├── useRecords.ts       # 记录数据 hook
│   │   │   ├── useCategories.ts    # 分类数据 hook
│   │   │   ├── useSync.ts          # 同步状态 hook
│   │   │   └── useTheme.ts         # 主题 hook
│   │   ├── utils/                  # 工具函数
│   │   │   ├── format.ts           # 金额/日期格式化
│   │   │   ├── storage.ts          # wx.storage 封装
│   │   │   ├── cloud.ts            # 云开发初始化
│   │   │   └── date.ts             # 日期计算工具
│   │   ├── types/                  # 类型定义
│   │   │   ├── record.ts
│   │   │   ├── category.ts
│   │   │   ├── user.ts
│   │   │   └── sync.ts
│   │   └── themes/                 # 主题变量定义
│   │       ├── warm.module.scss    # 暗夜暖阳（默认）
│   │       ├── mint.module.scss    # 薄荷清新
│   │       ├── dark.module.scss    # 墨夜金奢
│   │       ├── candy.module.scss   # 缤纷糖果
│   │       └── caramel.module.scss # 焦糖暖调
│   ├── project.config.json        # 微信小程序项目配置
│   └── package.json
│
├── cloud/                          # 云函数（独立部署）
│   ├── login/                      # 登录云函数
│   │   ├── index.js
│   │   └── package.json
│   ├── initCategories/             # 预设分类初始化
│   │   ├── index.js
│   │   └── package.json
│   ├── getMonthlyStats/            # 月度统计聚合
│   │   ├── index.js
│   │   └── package.json
│   └── syncRecords/                # 批量记录同步
│       ├── index.js
│       └── package.json
│
├── database/                       # 数据库初始化脚本
│   ├── schema.md                   # 集合结构与索引定义
│   └── init.js                     # 初始化权限规则
│
├── project.config.json             # 微信开发者工具配置
├── tsconfig.json                   # TypeScript 配置
├── package.json                    # 根 monorepo 配置
└── docs/                           # 项目文档
    └── superpowers/
        └── specs/
            └── 2026-06-25-jianji-design.md
```

---

## 3. 数据模型

### 3.1 集合一览

| 集合 | 说明 | 读写频率 | 预估数据量 |
|------|------|----------|------------|
| `users` | 用户信息 | 读高 / 写低 | 1 条/用户 |
| `records` | 记账记录 | 读写都高 | ~1000 条/用户/年 |
| `categories` | 收支分类 | 读高 / 写低 | ~20 条/用户 |

### 3.2 users

```typescript
interface User {
  _id: string;           // 云数据库自动生成
  _openid: string;        // 微信 openid，云开发自动维护
  phone: string;          // 绑定手机号（云函数解密后写入）
  theme: 'warm' | 'mint' | 'dark' | 'candy' | 'caramel';  // 当前主题
  createdAt: Date;        // 注册时间
}
```

**索引：** `_openid` 唯一索引（云开发自动创建）

**权限：** 仅创建者可读写 `doc._openid == auth.openid`

### 3.3 records

```typescript
interface Record {
  _id: string;            // 云数据库自动生成
  _openid: string;         // 所属用户 openid
  type: 'expense' | 'income';  // 收支类型
  amount: number;          // 金额，单位：分（整数存储，避免浮点精度问题）
  categoryId: string;      // 关联分类 _id
  note: string;            // 备注，最大 200 字符
  date: string;            // 记账日期 YYYY-MM-DD
  yearMonth: string;       // 冗余字段 YYYY-MM，用于按月查询优化
  syncStatus: 'synced' | 'pending'; // 同步状态（本地 → 云端后标记 synced）
  createdAt: Date;         // 记录创建时间
  updatedAt: Date;         // 最后修改时间
}
```

**索引：**
- `_openid + yearMonth` 复合索引（按月查询高频）
- `_openid + syncStatus` 复合索引（同步拉取）
- `_openid + date` 复合索引（日期范围查询）

**权限：** 仅创建者可读写 `doc._openid == auth.openid`

**设计要点：**

- 金额用**分**存储（`amount: number`），展示时除以 100，彻底避免 `0.1 + 0.2 = 0.30000000000000004` 问题
- `yearMonth` 冗余字段避免在查询时动态计算，直接命中索引
- 软删除：删除操作将 `updatedAt` 置为当前时间，`syncStatus` 标记为某删除状态

### 3.4 categories

```typescript
interface Category {
  _id: string;            // 云数据库自动生成
  _openid: string;         // 所属用户 openid
  name: string;            // 分类名称，最大 10 字符
  icon: string;            // emoji 图标
  type: 'expense' | 'income';  // 归属类型
  sort: number;            // 排序序号，数字越小越靠前
  isSystem: boolean;       // 是否系统预设（true 则不可删除）
  createdAt: Date;         // 创建时间
}
```

**索引：** `_openid + type + sort` 复合索引（按类型和排序查分类）

**权限：** 仅创建者可读写 `doc._openid == auth.openid`

**预设分类初始化：** 云函数 `initCategories` 在用户注册时自动创建 10 条预设分类（7 支出 + 3 收入），`isSystem: true`。

### 3.5 本地 Storage 结构

```
wx.storage:
├── records[]              # 全量记录缓存（最近 3 个月，按日期降序）
├── categories[]           # 全量分类缓存
├── pendingQueue[]         # 待同步操作队列
│   ├── { id, action: 'create' | 'update' | 'delete', data, timestamp }
│   └── ...
├── theme                  # 当前主题 ID（字符串）
├── userInfo               # { openid, phone?, avatarUrl? }
└── lastSyncAt             # 上次同步时间戳（毫秒）
```

### 3.6 离线队列设计

```typescript
interface PendingOperation {
  id: string;              // 本地生成的 UUID
  action: 'create' | 'update' | 'delete';
  collection: 'records' | 'categories';
  data: {
    _id?: string;          // 云端 ID（create 时无，update/delete 时有）
    [key: string]: any;    // 完整或部分字段
  };
  timestamp: number;       // 操作时间戳，用于冲突判断
  retryCount: number;      // 重试次数，上限 5 次后标记失败
}
```

---

## 4. 关键技术点

### 4.1 离线优先同步策略 ★★★

**问题：** 记账场景多为移动端使用，网络不稳定。用户记账时不能因无网络而卡住。

**方案：**

```
                    ┌──────────────┐
                    │   用户记账   │
                    └──────┬───────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   recordService.add()  │
              │   1. 生成本地 _id       │
              │   2. 写入 wx.storage   │
              │   3. 加入 pendingQueue │
              │   4. 更新 Context      │
              │   5. UI 即时刷新       │
              └────────┬───────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ 网络是否可用？   │
              └────┬───────┬────┘
                   │ YES   │ NO
                   ▼       ▼
         ┌──────────┐  ┌──────────────┐
         │ 调用云函数│  │ 保留在队列   │
         │ 写入云端  │  │ 等待网络恢复 │
         │ 标记 synced│  │ UI 轻提示    │
         └──────────┘  └──────┬───────┘
                              │ onNetworkStatusChange
                              ▼
                     ┌──────────────────┐
                     │ 批量处理队列     │
                     │ 先进先出，逐条同步│
                     │ 重试上限 5 次    │
                     └──────────────────┘
```

**关键实现：**

- 监听 `wx.onNetworkStatusChange`，网络恢复时自动触发 `sync.flush()`
- 同步队列按时间戳升序处理，保证操作顺序
- 冲突策略：比较 `updatedAt`，云端较新则覆盖本地，本地较新则上传覆盖云端
- 在「我的」页面展示 `pendingQueue.length`，用户可手动触发同步

### 4.2 自定义数字键盘 ★★☆

**问题：** 记账页需要快速输入金额，系统键盘需要弹起、收起，体验不一致且慢。需要内置键盘。

**方案：**

```
键盘布局（4x4）：
┌───┬───┬───┐
│ 1 │ 2 │ 3 │
├───┼───┼───┤
│ 4 │ 5 │ 6 │
├───┼───┼───┤
│ 7 │ 8 │ 9 │
├───┼───┼───┤
│ . │ 0 │ ⌫ │
└───┴───┴───┘
```

**技术细节：**
- 固定高度 `58vh`，不被系统键盘挤压
- 输入逻辑：整数部分最多 8 位，小数部分最多 2 位
- 小数点只能输入一次，`.00` → 显示 `0.00`
- 删除键支持长按连续删除
- 振动反馈 `wx.vibrateShort()` 每次按键
- `inputmode="none"` 阻止系统键盘

### 4.3 主题系统 ★★☆

**问题：** 5 套主题，全局即时切换，CSS 变量要覆盖所有页面和组件。

**方案：**

```
ThemeContext
    │
    ├── 读取 initialTheme (本地 storage → 云端 user.theme → 默认 warm)
    │
    ├── 切换时：
    │   1. setState 更新 Context
    │   2. 写入 wx.storage
    │   3. 异步同步到云端 users.theme
    │
    └── 消费：
        <ThemeProvider>
          <App />   ← 在 app.tsx 最外层注入
        </ThemeProvider>

CSS 变量方案：
:root[data-theme="warm"] {          :root[data-theme="mint"] {
  --page-bg: #1c1917;                 --page-bg: #ecfdf5;
  --primary: #FFB800;                 --primary: #10b981;
  --expense: #fb923c;                 --expense: #059669;
  ...                                 ...
}                                   }
```

**关键实现：**
- `ThemeProvider` 在 `useEffect` 中设置 `document.documentElement.dataset.theme`
- 各组件 SCSS 使用 `var(--expense)` 等变量的方式引用
- 新增主题：在 `themes/` 下新增 `.module.scss`，在 ThemeContext 注册，零组件改动

### 4.4 月度统计聚合 ★★★

**问题：** 月度统计需要按分类汇总当月所有记录。如果在前端计算，数据量大时性能不可控；50 条以内没问题，但 500+ 条时列表渲染 + 聚合计算会卡顿。

**方案：使用云函数做服务端聚合**

```
云函数 getMonthlyStats
  入参：{ yearMonth: '2026-06' }
  处理：
    1. db.collection('records')
       .where({ _openid, yearMonth })
       .get()
    2. 内存聚合：
       - 按 categoryId 分组，sum(amount)
       - 按 type 分组（expense/income），sum(amount)
       - 按日期分组，生成每日趋势
    3. 返回聚合结果
  返回：{ totalExpense, totalIncome, balance, categories[], daily[] }
```

**关键点：**
- 云函数有 300s 超时，V1 数据量完全够用
- 结果缓存到本地 Storage，相同 `yearMonth` 不重复请求
- 下拉刷新时强制重新获取

### 4.5 echarts-for-weixin 集成 ★★☆

**问题：** ECharts 在小程序中使用需要特殊适配（Canvas 渲染）。

**方案：**

```tsx
// RingChart 组件关键实现
import * as echarts from 'echarts-for-weixin';

// 1. 使用 ec-canvas 组件
<ec-canvas
  id="ring-chart"
  canvas-id="ring-chart"
  ec={{ onInit: initChart }}
/>

// 2. 延迟初始化（Canvas 需要 DOM 就绪）
const initChart = (canvas, width, height, dpr) => {
  const chart = echarts.init(canvas, null, { width, height, devicePixelRatio: dpr });
  canvas.setChart(chart);
  chart.setOption(options);
  return chart;
};
```

**注意事项：**
- `echarts-for-weixin` 包体积约 900KB，需按需引入（仅引入 Pie、Bar）
- 主题色与 CSS 变量保持一致，从 `getComputedStyle` 读取
- Canvas 在页面隐藏时 `dispose`，onShow 时重建，避免内存泄漏

### 4.6 预设分类初始化 ★☆☆

**问题：** 每个新用户注册后需要自动创建预设分类。

**方案：** 云函数 `initCategories` 在首次注册时触发。

```js
// cloud/initCategories/index.js
const PRESET_CATEGORIES = [
  // 支出
  { name: '餐饮', icon: '🍜', type: 'expense', sort: 1 },
  { name: '交通', icon: '🚇', type: 'expense', sort: 2 },
  // ... 共 10 条
];

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  // 查重：已有预设分类则跳过
  const exists = await db.collection('categories')
    .where({ _openid: OPENID, isSystem: true })
    .count();
  if (exists.total > 0) return { created: false };

  // 批量插入
  const tasks = PRESET_CATEGORIES.map(cat => ({
    ...cat, _openid: OPENID, isSystem: true, createdAt: new Date()
  }));
  await db.collection('categories').add(tasks); // 注意：需逐个 add
  return { created: true, count: tasks.length };
};
```

### 4.7 左滑删除组件 ★☆☆

**问题：** 小程序没有内置的左滑删除，需要手动实现。

**方案：** 使用 touch 事件实现。

```
核心逻辑（RecordItem 组件）：
1. touchstart: 记录 startX
2. touchmove:  计算 deltaX，translateX 跟随手指（限最大 -120rpx）
3. touchend:   |deltaX| > 40rpx → 吸附展开删除按钮
               |deltaX| < 40rpx → 回弹复位
4. 删除按钮： 宽度 120rpx，红色背景，点击触发二次确认弹窗
5. 滚动列表时：自动关闭已展开的项（父组件管理 openItemId）
```

### 4.8 金额精度处理 ★☆☆

**问题：** JavaScript 浮点数计算存在精度问题。

**方案：全链路用分存储，前端展示转换**

```typescript
// 输入：用户输入 35.50 → 存储 3550
function yuanToFen(yuan: number): number {
  return Math.round(yuan * 100);
}

// 展示：3550 → 显示 35.50
function fenToYuan(fen: number): string {
  return (fen / 100).toFixed(2);
}

// 格式化金额展示
function formatAmount(fen: number, type: 'expense' | 'income'): string {
  const sign = type === 'expense' ? '-' : '+';
  return `${sign}${fenToYuan(fen)}`;
}
```

**调用链：** 输入界面（元） → service 层转分 → 存储 → 展示层转元

### 4.9 技术风险与缓解

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| Taro 4 兼容性问题 | 编译失败或组件异常 | 中 | 技术选型时可降级到原生；优先使用 Taro 稳定版 API |
| echarts-for-weixin 包体积过大 | 小程序超 2MB 限制 | 高 | 按需引入图表类型，不引入完整 ECharts；必要时用 Canvas 2D 手绘 |
| 云开发免费额度不足 | 超出配额后服务停用 | 低 | 监控用量；V1 单用户数据量在免费额度内 |
| 离线同步冲突 | 数据不一致 | 中 | 明确冲突策略（最后写入获胜）；V2 可改进为 CRDT |
| 微信审核不通过 | 小程序无法上架 | 低 | 使用官方 API，不涉及 UGC 内容审核风险 |

---

## 附录 A：依赖清单

```json
{
  "dependencies": {
    "@tarojs/components": "4.x",
    "@tarojs/taro": "4.x",
    "@tarojs/react": "4.x",
    "react": "^18.2.0",
    "echarts-for-weixin": "latest"
  },
  "devDependencies": {
    "@tarojs/cli": "4.x",
    "@tarojs/webpack5-runner": "4.x",
    "typescript": "^5.3.0",
    "@types/react": "^18.2.0",
    "sass": "^1.70.0"
  }
}
```

## 附录 B：路由配置

```typescript
// app.config.ts
export default {
  pages: [
    'pages/index/index',           // 明细（首页）
    'pages/stats/stats',           // 统计
    'pages/add/add',               // 记账（全屏，非 Tab）
    'pages/mine/mine',             // 我的
    'pages/detail/detail',         // 记录详情
    'pages/categories/categories', // 分类管理
    'pages/theme/theme',           // 主题选择
    'pages/login/login',           // 登录授权
  ],
  tabBar: {
    list: [
      { pagePath: 'pages/index/index', text: '明细', iconPath: '...', selectedIconPath: '...' },
      { pagePath: 'pages/stats/stats', text: '统计', iconPath: '...', selectedIconPath: '...' },
    ],
  },
  window: {
    navigationBarBackgroundColor: '@navBarBg',
    navigationBarTitleText: '简记',
  },
};
```

> 注意：Tab Bar 中间「+」按钮通过 `tabBar.custom: true` 自定义实现，非标准 Tab 项。
