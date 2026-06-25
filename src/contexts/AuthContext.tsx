import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import type { User } from '@/types'
import { bindPhone as bindPhoneService, silentLogin } from '@/services/auth'
import { storage } from '@/services/storage'

interface AuthContextValue {
  user: User | null
  login: () => Promise<User>
  bindPhone: (code: string) => Promise<string>
  isLoggedIn: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(() => storage.getUser())

  const login = useCallback(async () => {
    const loggedInUser = await silentLogin()
    setUser(loggedInUser)
    return loggedInUser
  }, [])

  const bindPhone = useCallback(async (code: string) => {
    const phone = await bindPhoneService(code)
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, phone }
      storage.setUser(updated)
      return updated
    })
    return phone
  }, [])

  const value = useMemo(
    () => ({
      user,
      login,
      bindPhone,
      isLoggedIn: !!user?.openid,
    }),
    [user, login, bindPhone],
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
