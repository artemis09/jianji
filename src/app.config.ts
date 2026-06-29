export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/login/index',
    'pages/add/index',
    'pages/budget/index',
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
