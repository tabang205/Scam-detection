import apiClient from './config'

export const detectionService = {
  analyzeMessage: async (message, source = 'Manual') => {
    const response = await apiClient.post('/api/detect', { message, source })
    return response.data
  },
}

export const historyService = {
  getHistory: async (page = 1, limit = 25, filter = 'all', search = '', sort = 'newest') => {
    const response = await apiClient.get('/api/history', {
      params: { page, limit, filter, search, sort },
    })
    return response.data
  },
}

export const analyticsService = {
  getAnalytics: async (days = 7) => {
    const response = await apiClient.get('/api/analytics', {
      params: { days },
    })
    return response.data
  },
}

export default apiClient
