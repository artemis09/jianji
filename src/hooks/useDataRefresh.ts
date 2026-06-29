import { useEffect } from 'react'
import Taro from '@tarojs/taro'
import { DATA_CHANGED } from '@/services/data-events'

/** 订阅本地数据变更，增删改查后自动刷新页面 */
export function useDataRefresh(refresh: () => void): void {
  useEffect(() => {
    Taro.eventCenter.on(DATA_CHANGED, refresh)
    return () => {
      Taro.eventCenter.off(DATA_CHANGED, refresh)
    }
  }, [refresh])
}
