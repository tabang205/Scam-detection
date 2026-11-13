import { useState } from 'react'
import detectService from '../services/detectService'
import { useToast } from '../context/ToastContext'

export default function useDetect() {
  const [message, setMessage] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [logs, setLogs] = useState([])
  const { addToast } = useToast()

  const addLog = (text, type = 'info') => {
    setLogs((prev) => [...prev, { text, type, id: Date.now() + Math.random() }])
  }

  const analyze = async (text) => {
    const trimmed = text.trim()
    if (!trimmed || isAnalyzing) return

    setIsAnalyzing(true)
    setResult(null)
    setLogs([])

    const t0 = performance.now()
    addLog('> [SCAN] Đang chuẩn hóa văn bản & khởi chạy XLM-RoBERTa Engine...', 'info')

    // Warmup hint after 3s on first model load
    const warmupTimer = setTimeout(() => {
      addLog('> [CHỜ] Mô hình AI đang nạp trọng số vào bộ nhớ, vui lòng đợi...', 'warn')
    }, 3000)

    try {
      const data = await detectService.analyzeMessage(trimmed)
      clearTimeout(warmupTimer)
      const elapsedMs = Math.max(1, Math.round(performance.now() - t0))

      if (data.prediction === 'Scam') {
        addLog(`> [BÁO ĐỘNG] Phát hiện dấu hiệu lừa đảo (${elapsedMs} ms)`, 'error')
        addLog(`> [KẾT QUẢ] Độ tin cậy: ${data.confidence}% — Mức độ: ${data.threat_level}`, 'error')
        addToast('ĐE DỌA NGUY HIỂM: Phát hiện dấu hiệu lừa đảo trong nội dung tin nhắn!', 'error')
      } else {
        addLog(`> [OK] Nội dung tin nhắn có vẻ an toàn (${elapsedMs} ms)`, 'success')
        addLog(`> [KẾT QUẢ] Độ tin cậy: ${data.confidence}% — Không phát hiện mối đe dọa.`, 'success')
        addToast('XÁC THỰC: Nội dung tin nhắn được đánh giá là an toàn.', 'success')
      }

      setResult(data)
      return data
    } catch (err) {
      clearTimeout(warmupTimer)
      const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout')
      if (isTimeout) {
        addLog('> [LỖI] Kết nối quá hạn — Model AI có thể đang khởi động. Thử lại sau vài giây.', 'error')
        addToast('TIMEOUT: Model AI đang khởi động. Vui lòng thử lại sau 30 giây.', 'error')
      } else {
        addLog(`> [LỖI] Phân tích thất bại: ${err.message}`, 'error')
        addToast(`QUÉT THẤT BẠI: ${err.message}`, 'error')
      }
      throw err
    } finally {
      setIsAnalyzing(false)
    }
  }

  return {
    message,
    setMessage,
    isAnalyzing,
    result,
    logs,
    analyze,
    addLog,
  }
}
