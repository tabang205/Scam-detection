/**
 * detectService — Realtime message scanning API wrapper.
 * Interacts with /api/detect FastAPI endpoint.
 */

import apiClient from './config'

const detectService = {
  /**
   * Send suspicious text message to AI scanner node
   * @param {string} message - Suspect message text payload
   * @returns {Promise<object>} Prediction JSON payload from AI model
   */
  analyzeMessage: async (message) => {
    const response = await apiClient.post('/api/detect', { message })
    return response.data
  },
}

export default detectService
export { detectService }
