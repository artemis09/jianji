import Taro from '@tarojs/taro'

/** 同步微信 page 窗口底色，避免 Tab 切换闪白 */
export function applyPageBackground(pageBg: string): void {
  Taro.setBackgroundColor({
    backgroundColor: pageBg,
    backgroundColorTop: pageBg,
    backgroundColorBottom: pageBg,
  }).catch(() => {})
}
