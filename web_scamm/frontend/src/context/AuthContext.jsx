import { createContext, useContext, useState, useEffect } from 'react'
import apiClient from '../services/config'

const AuthContext = createContext(null)

// Helper: safely parse JSON from localStorage
function getStoredUser() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

export function AuthProvider({ children }) {
  // Lazy initializers read from localStorage at mount — no setState in effects needed
  const [user, setUser] = useState(() => {
    const storedToken = localStorage.getItem('token')
    return storedToken ? getStoredUser() : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(false)

  // Sync axios Authorization header & clear session if backend rejects expired JWT
  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete apiClient.defaults.headers.common['Authorization']
    }
  }, [token])

  useEffect(() => {
    const handleExpired = () => {
      setToken(null)
      setUser(null)
    }
    window.addEventListener('auth:expired', handleExpired)
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [])

  const translateError = (msg) => {
    if (!msg) return msg
    const lower = msg.toLowerCase()
    if (lower.includes('invalid credentials')) return 'Thông tin đăng nhập không chính xác'
    if (lower.includes('email already registered')) return 'Email này đã được đăng ký trước đó'
    if (lower.includes('email must have') || lower.includes('định dạng email')) return 'Định dạng email không hợp lệ'
    if (lower.includes('authentication failed')) return 'Xác thực tài khoản thất bại'
    if (lower.includes('registration failed')) return 'Đăng ký tài khoản thất bại'
    if (lower.includes('status code 502') || lower.includes('status code 503') || lower.includes('status code 504')) {
      return 'Máy chủ đang khởi động, vui lòng đợi vài giây rồi thử lại.'
    }
    if (lower.includes('status code 500')) {
      return 'Lỗi nội bộ máy chủ. Vui lòng thử lại sau.'
    }
    if (lower.includes('network error') || lower.includes('cannot establish connection')) {
      return 'Lỗi kết nối: Không thể kết nối tới máy chủ. Hãy đảm bảo Backend đang chạy.'
    }
    return msg
  }

  const login = async (email, password) => {
    setLoading(true)
    try {
      const response = await apiClient.post('/api/auth/login', { email, password })
      const { access_token, user: userData } = response.data

      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))

      setToken(access_token)
      setUser(userData)
      return { success: true }
    } catch (error) {
      const rawError = error.message || 'Authentication failed'
      return {
        success: false,
        error: translateError(rawError)
      }
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password) => {
    try {
      const response = await apiClient.post('/api/auth/register', { name, email, password })
      return { success: true, message: response.data.message }
    } catch (error) {
      const rawError = error.message || 'Registration failed'
      return {
        success: false,
        error: translateError(rawError)
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
