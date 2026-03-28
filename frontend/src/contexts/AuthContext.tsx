import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import axios from 'axios'

const API_BASE = '/api/auth'

export interface UserInfo {
  id: number
  name: string
  email: string
  role: 'USER' | 'ADMIN'
}

export interface SpaceInfo {
  id: number
  name: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  memberCount: number
  plan: string
}

interface AuthContextType {
  user: UserInfo | null
  token: string | null
  spaces: SpaceInfo[]
  currentSpace: SpaceInfo | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, companyName?: string) => Promise<void>
  logout: () => void
  switchSpace: (spaceId: number) => void
  refreshSpaces: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

// Shared axios instance with JWT interceptor
const api = axios.create()

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('finio_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('finio_refresh_token')
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE}/refresh`, { refreshToken })
          const data = res.data.data || res.data
          localStorage.setItem('finio_token', data.token)
          localStorage.setItem('finio_refresh_token', data.refreshToken)
          originalRequest.headers.Authorization = `Bearer ${data.token}`
          return api(originalRequest)
        } catch {
          // Refresh failed, clear everything
          localStorage.removeItem('finio_token')
          localStorage.removeItem('finio_refresh_token')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

/**
 * Helper to unwrap unified ApiResponse format.
 * Backend returns { code, message, data } - we need the `data` field.
 */
function unwrap(res: any) {
  // Support both { data: {...} } (wrapped) and direct response
  if (res.data && typeof res.data === 'object' && 'data' in res.data && 'code' in res.data) {
    return res.data.data
  }
  return res.data
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('finio_token'))
  const [spaces, setSpaces] = useState<SpaceInfo[]>([])
  const [currentSpace, setCurrentSpace] = useState<SpaceInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get(`${API_BASE}/me`)
      setUser(unwrap(res))
      await fetchSpaces()
    } catch {
      localStorage.removeItem('finio_token')
      localStorage.removeItem('finio_refresh_token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchSpaces = async () => {
    try {
      const res = await api.get('/api/spaces/my')
      const spaceList: SpaceInfo[] = unwrap(res) || []
      setSpaces(spaceList)

      const savedSpaceId = localStorage.getItem('finio_space_id')
      const saved = spaceList.find((s) => s.id === Number(savedSpaceId))
      setCurrentSpace(saved || spaceList[0] || null)
    } catch {
      setSpaces([])
    }
  }

  const login = async (email: string, password: string) => {
    const res = await api.post(`${API_BASE}/login`, { email, password })
    const data = unwrap(res)
    localStorage.setItem('finio_token', data.token)
    localStorage.setItem('finio_refresh_token', data.refreshToken)
    setToken(data.token)
    setUser(data.user)
    await fetchSpaces()
  }

  const register = async (name: string, email: string, password: string, companyName?: string) => {
    const res = await api.post(`${API_BASE}/register`, { name, email, password, companyName })
    const data = unwrap(res)
    localStorage.setItem('finio_token', data.token)
    localStorage.setItem('finio_refresh_token', data.refreshToken)
    setToken(data.token)
    setUser(data.user)
    await fetchSpaces()
  }

  const logout = useCallback(() => {
    localStorage.removeItem('finio_token')
    localStorage.removeItem('finio_refresh_token')
    localStorage.removeItem('finio_space_id')
    setToken(null)
    setUser(null)
    setSpaces([])
    setCurrentSpace(null)
  }, [])

  const switchSpace = useCallback((spaceId: number) => {
    const space = spaces.find((s) => s.id === spaceId)
    if (space) {
      setCurrentSpace(space)
      localStorage.setItem('finio_space_id', String(spaceId))
    }
  }, [spaces])

  const refreshSpaces = useCallback(async () => {
    await fetchSpaces()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        spaces,
        currentSpace,
        loading,
        login,
        register,
        logout,
        switchSpace,
        refreshSpaces,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
