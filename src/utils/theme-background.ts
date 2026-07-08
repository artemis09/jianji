import Taro from '@tarojs/taro'

let latestBg = ''
let timer: ReturnType<typeof setTimeout> | undefined

/** 同步微信 page 窗口底色；延后到宏任务，避免 load 阶段调用引发 LifeCycle 冲突 */
export function applyPageBackground(pageBg: string): void {
  latestBg = pageBg
  if (timer !== undefined) return
  timer = setTimeout(() => {
    timer = undefined
    const bg = latestBg
    Taro.setBackgroundColor({
      backgroundColor: bg,
      backgroundColorTop: bg,
      backgroundColorBottom: bg,
    }).catch(() => {})
  }, 0)
}
