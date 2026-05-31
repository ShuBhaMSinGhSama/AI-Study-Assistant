import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  getStoredUser,
  getAccessToken,
  loginUser,
  registerUser,
  logoutUser,
  fetchProfile,
  clearAuth,
} from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())
  const [loading, setLoading] = useState(true)

  // Check if user is still valid on mount
  useEffect(() => {
    const token = getAccessToken()
    if (token && user) {
      fetchProfile()
        .then((profile) => setUser(profile))
        .catch(() => {
          clearAuth()
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const data = await loginUser(credentials)
    setUser(data.user)
    return data
  }, [])

  const register = useCallback(async (credentials) => {
    const data = await registerUser(credentials)
    setUser(data.user)
    return data
  }, [])

  const logout = useCallback(async () => {
    await logoutUser()
    setUser(null)
  }, [])

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
