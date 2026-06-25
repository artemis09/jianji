export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/add/index',
    'pages/stats/index',
    'pages/profile/index',
    'pages/theme/index',
    'pages/categories/index',
    'pages/login/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1c1917',
    navigationBarTitleText: '简记',
    navigationBarTextStyle: 'white',
    navigationStyle: 'custom',
  },
  cloud: true,
})
