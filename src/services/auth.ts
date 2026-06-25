import Taro from '@tarojs/taro'
import type { User } from '@/types'
import { storage } from './storage'

export async function silentLogin(): Promise<User> {
  await Taro.cloud.init()
  const { result } = await Taro.cloud.callFunction({ name: 'login' })
  const { openid } = result as { openid: string }

  let user = storage.getUser()
  if (!user) {
    user = { openid, theme: storage.getTheme() }
    storage.setUser(user)
  }

  return user
}

export async function bindPhone(code: string): Promise<string> {
  const { result } = await Taro.cloud.callFunction({
    name: 'decryptPhone',
    data: { code },
  })

  const data = result as { phone?: string; errMsg?: string }
  if (data.errMsg || !data.phone) {
    throw new Error(data.errMsg || '绑定手机号失败')
  }

  const user = storage.getUser()
  if (user) {
    storage.setUser({ ...user, phone: data.phone })
  }

  return data.phone
}
