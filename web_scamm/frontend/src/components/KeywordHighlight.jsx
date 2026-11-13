/**
 * KeywordHighlight — Displays the flagged linguistic indicators,
 * with context info chips and warning icons.
 */

import GlassPanel from './GlassPanel'

export default function KeywordHighlight({ keywords = [], prediction = 'Safe' }) {
  const isScam = prediction === 'Scam'

  return (
    <GlassPanel className="p-6">
      {/* Title */}
      <h4 className="font-code-label text-on-surface-variant uppercase mb-4 tracking-widest flex items-center gap-2 text-xs">
        <span className="material-symbols-outlined text-sm">biotech</span>
        Phân tích Heuristic
      </h4>

      {/* Matching list */}
      <div className="space-y-3">
        {isScam && keywords.length > 0 ? (
          keywords.map((kw, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg bg-secondary-container/5 border border-secondary-container/10 hover:border-secondary-container/30 transition-colors"
            >
              <span className="material-symbols-outlined text-secondary text-lg mt-0.5">
                dangerous
              </span>
              <div>
                <p className="font-code-label text-[11px] text-secondary font-bold uppercase tracking-wider">
                  Phát hiện Từ ngữ Độc hại
                </p>
                <p className="font-body-sm text-on-surface mt-0.5">
                  Khớp từ ngữ: <span className="bg-secondary/15 text-secondary px-1.5 py-0.5 rounded font-mono text-xs font-semibold">"{kw}"</span>
                </p>
              </div>
            </div>
          ))
        ) : isScam ? (
          /* Scam predicted but no simple regex keyword matched (deep learning trigger) */
          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary-container/5 border border-secondary-container/10">
            <span className="material-symbols-outlined text-secondary text-lg mt-0.5">
              psychology
            </span>
            <div>
              <p className="font-code-label text-[11px] text-secondary font-bold uppercase tracking-wider">
                Khớp Mẫu Ngữ nghĩa Chuyên sâu
              </p>
              <p className="text-body-sm text-on-surface-variant mt-0.5 opacity-80 leading-relaxed">
                Mạng nơ-ron phát hiện cấu trúc thao túng và áp lực tâm lý không trùng khớp với các từ khóa đơn giản.
              </p>
            </div>
          </div>
        ) : (
          /* Clean message */
          <>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10 opacity-75">
              <span className="material-symbols-outlined text-primary-fixed-dim text-lg mt-0.5">
                verified
              </span>
              <div>
                <p className="font-code-label text-[11px] text-primary-fixed-dim font-bold uppercase tracking-wider">
                  Ngôn ngữ An toàn
                </p>
                <p className="font-body-sm text-on-surface-variant mt-0.5 leading-relaxed">
                  Không phát hiện từ khóa rủi ro cao.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-surface-variant/20 border border-outline-variant/10 opacity-40">
              <span className="material-symbols-outlined text-on-surface-variant text-lg mt-0.5">
                history_edu
              </span>
              <div>
                <p className="font-code-label text-[11px] text-on-surface-variant uppercase tracking-wider">
                  Heuristic Cơ sở Ổn định
                </p>
                <p className="font-body-sm text-on-surface-variant mt-0.5">
                  Cấu trúc ngữ nghĩa tương thích với các mẫu hội thoại giao tiếp thông thường đã xác minh.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </GlassPanel>
  )
}
