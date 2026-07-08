import Taro from '@tarojs/taro'

export const PRIVACY_AUTH_EVENT = 'needPrivacyAuthorization'

type PrivacyResolve = (detail: { event: 'agree' | 'disagree'; buttonId?: string }) => void

interface WxPrivacyApi {
  onNeedPrivacyAuthorization?: (listener: (resolve: PrivacyResolve) => void) => void
  getPrivacySetting?: (options: {
    success?: (res: { needAuthorization: boolean; privacyContractName: string }) => void
    fail?: () => void
  }) => void
  openPrivacyContract?: (options?: { fail?: () => void }) => void
}

function getWx(): WxPrivacyApi | undefined {
  return (globalThis as { wx?: WxPrivacyApi }).wx
}

/** 注册微信官方隐私授权弹窗回调（需在 app 启动时调用） */
export function setupWechatPrivacyAuthorization(): void {
  if (process.env.TARO_ENV !== 'weapp') return
  const wxApi = getWx()
  if (!wxApi?.onNeedPrivacyAuthorization) return

  wxApi.onNeedPrivacyAuthorization((resolve: PrivacyResolve) => {
    Taro.eventCenter.trigger(PRIVACY_AUTH_EVENT, resolve)
  })
}

export function getPrivacySetting(): Promise<{ needAuthorization: boolean; privacyContractName: string }> {
  return new Promise(resolve => {
    const wxApi = getWx()
    if (!wxApi?.getPrivacySetting) {
      resolve({ needAuthorization: false, privacyContractName: '' })
      return
    }
    wxApi.getPrivacySetting({
      success: res => resolve(res),
      fail: () => resolve({ needAuthorization: false, privacyContractName: '' }),
    })
  })
}

export function openWechatPrivacyContract(): void {
  const wxApi = getWx()
  if (!wxApi?.openPrivacyContract) {
    Taro.navigateTo({ url: '/pages/privacy/index' })
    return
  }
  wxApi.openPrivacyContract({
    fail: () => {
      Taro.navigateTo({ url: '/pages/privacy/index' })
    },
  })
}
