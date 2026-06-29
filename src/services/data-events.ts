import Taro from '@tarojs/taro'

export const DATA_CHANGED = 'dataChanged'

export function notifyDataChanged(): void {
  Taro.eventCenter.trigger(DATA_CHANGED)
}
