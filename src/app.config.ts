export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/login/index',
    'pages/add/index',
    'pages/budget/index',
    'pages/stats/index',
    'pages/bill/index',
    'pages/profile/index',
    'pages/theme/index',
    'pages/categories/index',
    'pages/agreement/index',
    'pages/privacy/index',
  ],
  // 启用微信隐私合规检查（收集手机号等敏感信息必需）
  __usePrivacyCheck__: true,
  window: {
    backgroundTextStyle: 'light',
    backgroundColor: '#1a1a1a',
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
    borderStyle: 'black',
    list: [
      { pagePath: 'pages/index/index', text: '明细' },
      { pagePath: 'pages/stats/index', text: '图表' },
      { pagePath: 'pages/bill/index', text: '账单' },
      { pagePath: 'pages/profile/index', text: '我的' },
    ],
  },
  cloud: true,
})
