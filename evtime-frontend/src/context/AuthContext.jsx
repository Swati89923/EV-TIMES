import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { TOKEN_KEY, getStoredAuth } from '../api/client'
import * as authApi from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredAuth())
  const queryClient = useQueryClient()

  const persist = useCallback((data) => {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(data))
    setUser(data)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
    queryClient.removeQueries({ queryKey: ['bookmarks'] })
  }, [queryClient])

  useEffect(() => {
    window.addEventListener('evtimes:unauthorized', logout)
    return () => window.removeEventListener('evtimes:unauthorized', logout)
  }, [logout])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user?.token,
      isStaff: user?.role === 'ADMIN' || user?.role === 'EDITOR',
      login: async (body) => persist(await authApi.login(body)),
      signup: async (body) => persist(await authApi.signup(body)),
      logout,
    }),
    [user, persist, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
