/**
 * LoadingScanner — Displays the active scanning animation overlay
 * and real-time terminal logs with cyber theme.
 */

import { useEffect, useRef } from 'react'

export default function LoadingScanner({ logs = [] }) {
  const bottomRef = useRef(null)

  // Auto-scroll terminal to bottom when new logs arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <div className="glass-panel rounded-xl overflow-hidden border border-outline-variant/10 shadow-[0_0_20px_rgba(0,219,231,0.05)]">
      {/* Terminal Title Bar */}
      <div className="bg-surface-container-high px-4 py-2.5 flex items-center justify-between border-b border-outline-variant/10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-error-container" />
          <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
          <div className="w-2.5 h-2.5 rounded-full bg-primary-fixed-dim" />
          <span className="font-code-label ml-2 text-xs text-on-surface-variant opacity-70">
            neural_telemetry_scan.sys
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-primary-fixed-dim rounded-full animate-ping" />
          <span className="font-code-label text-[10px] text-primary/80 uppercase tracking-widest">
            Máy quét Hoạt động
          </span>
        </div>
      </div>

      {/* Terminal logs list */}
      <div className="p-4 bg-black/70 min-h-[140px] max-h-[180px] overflow-y-auto font-code-label text-[11px] leading-relaxed text-primary/80 space-y-1.5 scrollbar-thin">
        <p className="text-on-surface-variant opacity-50">&gt; [HỆ THỐNG] Khởi tạo tham số mô hình Transformer...</p>
        <p className="text-on-surface-variant opacity-50">&gt; [HỆ THỐNG] Đã tải thành công từ vựng subword (64,001).</p>
        <p className="text-on-surface-variant opacity-60">&gt; [THÔNG TIN] Đang giám sát dữ liệu trực tiếp.</p>

        {logs.map((log) => (
          <p
            key={log.id}
            className={`transition-all duration-300 ${
              log.type === 'error' ? 'text-secondary font-semibold animate-pulse' :
              log.type === 'success' ? 'text-primary-fixed-dim font-semibold' :
              log.type === 'warn' ? 'text-secondary-fixed' :
              'text-on-surface-variant'
            }`}
          >
            {log.text}
          </p>
        ))}

        {/* Auto-scroll anchor */}
        <div ref={bottomRef} />

        {/* Pulsing prompt at the bottom */}
        <div className="flex items-center gap-1.5 pt-1 text-primary-fixed-dim">
          <span>&gt;</span>
          <span className="w-2 h-4 bg-primary-fixed-dim animate-pulse" />
        </div>
      </div>
    </div>
  )
}
