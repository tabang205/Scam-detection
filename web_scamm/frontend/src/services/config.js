import axios from 'axios'

// Dedicated API Config
const API_URL = import.meta.env.VITE_API_URL || ''
const DEFAULT_TIMEOUT = 120000 // 120 seconds — AI model inference can take time on first load

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach JWT Token automatically if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Global Error and Timeout Handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let customError = 'Lỗi kết nối không xác định. Vui lòng thử lại.'
    
    if (error.code === 'ECONNABORTED') {
      customError = 'Kết nối quá thời gian: AI model đang xử lý lâu hơn dự kiến. Vui lòng thử lại.'
    } else if (error.response) {
      const status = error.response.status
      if (status === 502 || status === 503 || status === 504) {
        customError = `Server error: Status code ${status}`
      } else if (status === 400) {
        customError = error.response.data?.detail || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.'
      } else if (status === 401) {
        const reqUrl = error.config?.url || ''
        if (!reqUrl.includes('/api/auth/')) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.dispatchEvent(new Event('auth:expired'))
          customError = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
        } else {
          customError = error.response.data?.detail || 'Thông tin đăng nhập không chính xác'
        }
      } else if (status === 500) {
        customError = 'Server error: Status code 500'
      } else {
        customError = error.response.data?.detail || `Server error: Status code ${status}`
      }
    } else if (error.request) {
      customError = 'Network error: Cannot establish connection to the AI Scam Shield node. Ensure backend is running.'
    }
    
    error.message = customError
    return Promise.reject(error)
  }
)

export default apiClient
