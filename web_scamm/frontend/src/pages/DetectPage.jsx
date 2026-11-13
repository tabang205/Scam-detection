/**
 * DetectPage — Real-Time Detection Engine
 * Integrates modular components: DetectForm, ResultCard, LoadingScanner, and KeywordHighlight.
 */

import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import useDetect from '../hooks/useDetect'
import DetectForm from '../components/DetectForm'
import ResultCard from '../components/ResultCard'
import LoadingScanner from '../components/LoadingScanner'
import KeywordHighlight from '../components/KeywordHighlight'

export default function DetectPage() {
  const location = useLocation()
  const hasAnalyzed = useRef(false)
  const {
    message,
    setMessage,
    isAnalyzing,
    result,
    logs,
    analyze,
  } = useDetect()

  useEffect(() => {
    if (location.state?.message && !hasAnalyzed.current) {
      hasAnalyzed.current = true
      setMessage(location.state.message)
      analyze(location.state.message)
      window.history.replaceState({}, document.title)
    }
  }, [location.state, setMessage, analyze])

  return (
    <div className="space-y-6">
      {/* Page Hero Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-lg font-bold text-on-surface">Động cơ Phát hiện Thời gian thực</h2>
          <p className="text-on-surface-variant font-body-md opacity-80">
            Phân tích thông tin kỹ thuật số để tìm các mẫu lừa đảo bằng Custom Transformer Neural Scan v4.2
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-sm bg-primary/10 border border-primary/20">
          <span className="w-2 h-2 bg-primary-fixed-dim rounded-full pulsing-dot" />
          <span className="font-code-label text-primary">Nhân Hệ thống: Hoạt động</span>
        </div>
      </section>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input & Logging column */}
        <div className="lg:col-span-7 space-y-6">
          <DetectForm
            message={message}
            onChange={setMessage}
            onAnalyze={() => analyze(message)}
            isAnalyzing={isAnalyzing}
          />
          
          {/* Always display terminal logs (shows initialization on idle, active progress on scan) */}
          <LoadingScanner logs={logs} />
        </div>

        {/* Output & Heuristics column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Result card displaying verdicts & confidence scales */}
          {result && <ResultCard result={result} />}

          {/* Heuristic lists showcasing key targets & indicators */}
          <KeywordHighlight
            keywords={result?.keywords}
            prediction={result?.prediction}
          />
        </div>
      </div>
    </div>
  )
}
