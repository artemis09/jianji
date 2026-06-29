import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import Taro from '@tarojs/taro'
import type { User } from '@/types'
import { bindPhone as bindPhoneService, ensureCloudLogin, refreshCloudLogin } from '@/services/auth'
import { isCloudFunctionNotFoundError, isCloudNotEnabledError, isTimeoutError } from '@/services/cloud'
import { storage } from '@/services/storage'

interface AuthContextValue {
  user: User | null
  login: () => Promise<User>
  bindPhone: (code: string) => Promise<string>
  isLoggedIn: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function showAuthBootstrapError(err: unknown): void {
  if (isTimeoutError(err)) return

  if (isCloudNotEnabledError(err)) {
    Taro.showModal({
      title: '云开发未开通',
      content:
        '请用微信开发者工具打开项目根目录（jianji/，不是 dist/），点击顶部「云开发」开通环境，然后右键 cloud/functions/login 上传部署。',
      showCancel: false,
    })
    return
  }

  if (isCloudFunctionNotFoundError(err)) {
    Taro.showModal({
      title: '云函数未部署',
      content:
        '请在微信开发者工具中展开 cloud/functions，右键 login →「上传并部署：云端安装依赖」，同样部署 decryptPhone。',
      showCancel: false,
    })
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(() => storage.getUser())

  const login = useCallback(async () => {
    const loggedInUser = await ensureCloudLogin()
    setUser(loggedInUser)
    return loggedInUser
  }, [])

  const bindPhoneHandler = useCallback(async (code: string) => {
    const phone = await bindPhoneService(code)
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, phone }
      storage.setUser(updated)
      return updated
    })
    return phone
  }, [])

  useEffect(() => {
    const cached = storage.getUser()

    if (!cached?.openid) {
      const timer = setTimeout(() => {
        void ensureCloudLogin()
          .then(loggedInUser => setUser(loggedInUser))
          .catch(err => {
            console.error('silentLogin failed', err)
            showAuthBootstrapError(err)
          })
      }, 1000)
      return () => clearTimeout(timer)
    }

    if (!cached.phone) return undefined

    const timer = setTimeout(() => {
      void refreshCloudLogin().then(loggedInUser => {
        if (!loggedInUser) return
        setUser(prev => {
          if (prev?.openid === loggedInUser.openid && prev?.phone === loggedInUser.phone) {
            return prev
          }
          return loggedInUser
        })
      })
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const value = useMemo(
    () => ({
      user,
      login,
      bindPhone: bindPhoneHandler,
      isLoggedIn: !!user?.openid,
    }),
    [user, login, bindPhoneHandler],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
