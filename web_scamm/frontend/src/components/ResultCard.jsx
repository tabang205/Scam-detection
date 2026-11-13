/**
 * ResultCard — Displays classification output cards,
 * incorporating ThreatMeter and color-coded alert widgets.
 */

import GlassPanel from './GlassPanel'
import ThreatBadge from './ThreatBadge'
import ThreatMeter from './ThreatMeter'

export default function ResultCard({ result }) {
  if (!result) return null

  const isScam = result.prediction === 'Scam'

  return (
    <GlassPanel
      className={`relative overflow-hidden p-6 border-l-4 transition-all duration-500 ${
        isScam
          ? 'border-l-secondary-container shadow-[0_0_35px_rgba(255,82,92,0.08)]'
          : 'border-l-primary-fixed-dim shadow-[0_0_35px_rgba(0,219,231,0.08)]'
      }`}
    >
      {/* Laser scan line overlay when scam is detected */}
      {isScam && <div className="scan-line" />}

      {/* Top Section */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          {/* Status Icon */}
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center border transition-all ${
              isScam
                ? 'bg-secondary-container/10 border-secondary-container/20 threat-pulse'
                : 'bg-primary/10 border-primary/20'
            }`}
          >
            <span
              className={`material-symbols-outlined text-4xl ${
                isScam ? 'text-secondary' : 'text-primary'
              }`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {isScam ? 'gpp_maybe' : 'verified_user'}
            </span>
          </div>

          {/* Verdict details */}
          <div>
            <h3
              className={`text-2xl font-bold tracking-tight ${
                isScam ? 'text-secondary' : 'text-primary'
              }`}
              style={{ fontFamily: 'Geist' }}
            >
              {isScam ? '⚠ Dấu hiệu Lừa đảo' : '✓ Tin nhắn An toàn'}
            </h3>
            <p className="font-code-label text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">
              Kết luận hệ thống: {isScam ? 'LỪA ĐẢO' : 'AN TOÀN'}
            </p>
          </div>
        </div>

        {/* Right threat badge */}
        <ThreatBadge type={result.threat_level}>
          {result.threat_level === 'High' ? 'Cao' : result.threat_level === 'Medium' ? 'Trung bình' : 'Thấp'}
        </ThreatBadge>
      </div>

      {/* Threat Meter segment */}
      <div className="mb-6 pt-4 border-t border-outline-variant/10">
        <ThreatMeter
          value={result.confidence}
          isScam={isScam}
          threatLevel={result.threat_level}
        />
      </div>

      {/* Structured metrics summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container-low/40 p-3 rounded-lg border border-outline-variant/5">
          <p className="font-code-label text-[9px] text-on-surface-variant uppercase tracking-wider mb-1">
            PHÂN LOẠI
          </p>
          <p className="text-lg font-bold text-on-surface uppercase tracking-tight" style={{ fontFamily: 'Geist' }}>
            {isScam ? 'LỪA ĐẢO' : 'AN TOÀN'}
          </p>
        </div>
        <div className="bg-surface-container-low/40 p-3 rounded-lg border border-outline-variant/5">
          <p className="font-code-label text-[9px] text-on-surface-variant uppercase tracking-wider mb-1">
            Dấu hiệu ngôn ngữ
          </p>
          <p className="text-lg font-bold text-on-surface tracking-tight" style={{ fontFamily: 'Geist' }}>
            {result.keywords?.length || 0} Từ nghi vấn
          </p>
        </div>
      </div>
    </GlassPanel>
  )
}
