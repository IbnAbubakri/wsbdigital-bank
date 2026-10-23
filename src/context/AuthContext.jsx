import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as db from '../lib/db'

const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    const id = db.getSessionUid()
    setUser(id ? db.getUser(id) : null)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
    return db.subscribe(refresh)
  }, [refresh])

  const login = useCallback(
    async (email, password) => {
      const next = db.login(email, password)
      refresh()
      return next
    },
    [refresh],
  )

  const signup = useCallback(
    async (payload) => {
      const next = db.signup(payload)
      db.setSession(next.uid)
      refresh()
      return next
    },
    [refresh],
  )

  const logout = useCallback(() => {
    db.logout()
    refresh()
  }, [refresh])

  const value = useMemo(
    () => ({ user, currentUser: user, loading, login, signup, logout, refresh }),
    [user, loading, login, signup, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
