/**
 * DetectForm — Input form with textarea and submit button
 * incorporating glassmorphism styling and character counters.
 */

import GlassPanel from './GlassPanel'

export default function DetectForm({
  message = '',
  onChange,
  onAnalyze,
  isAnalyzing = false,
  maxLength = 1000,
}) {
  const handleSubmit = (e) => {
    e.preventDefault()
    onAnalyze()
  }

  return (
    <GlassPanel className="relative overflow-hidden p-6 border border-outline-variant/15 shadow-[0_0_30px_rgba(0,219,231,0.03)]">
      {/* Background glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form header labels */}
        <div className="flex items-center justify-between">
          <label className="font-code-label text-xs uppercase text-on-surface-variant tracking-wider">
            Nội dung truyền tin đầu vào
          </label>
          <span className="text-[9px] font-code-label bg-surface-container-high px-2 py-0.5 rounded-sm text-on-surface-variant border border-outline-variant/10">
            AUTO-DETECT / UTF-8
          </span>
        </div>

        {/* Text area wrapper with neon glow on focus */}
        <div className="relative border border-outline-variant/30 rounded-lg bg-black/40 p-4 transition-all focus-within:border-primary/50 focus-within:shadow-[0_0_15px_rgba(0,219,231,0.15)]">
          <textarea
            value={message}
            onChange={(e) => onChange(e.target.value)}
            disabled={isAnalyzing}
            placeholder="Dán tin nhắn, email nghi ngờ hoặc đề nghị tặng crypto miễn phí vào đây..."
            className="w-full bg-transparent border-none focus:ring-0 text-on-surface font-body-md resize-none placeholder:text-on-surface-variant/20 outline-none min-h-[220px]"
            maxLength={maxLength}
          />

          {/* Form Actions bar inside the text box bottom */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-outline-variant/10">
            <span className="font-code-label text-xs text-on-surface-variant">
              {message.length} / {maxLength} Ký tự
            </span>
            
            <button
              type="submit"
              disabled={isAnalyzing || !message.trim()}
              className="flex items-center gap-2 px-8 py-3 bg-primary-container text-on-primary-container font-bold font-code-label rounded-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,219,231,0.3)] hover:shadow-[0_0_25px_rgba(0,219,231,0.5)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                  Đang phân tích dữ liệu...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">analytics</span>
                  Phân tích Tin nhắn
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </GlassPanel>
  )
}
