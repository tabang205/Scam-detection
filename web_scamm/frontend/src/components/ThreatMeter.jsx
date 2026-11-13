/**
 * ThreatMeter — Renders threat scale and risk levels
 * utilizing harmonized color schemes and neon styles.
 */

export default function ThreatMeter({ value = 0, isScam = false, threatLevel = 'Low' }) {
  const roundedValue = Math.round(value)

  const getMeterColor = () => {
    if (!isScam) return 'from-primary-fixed-dim to-primary'
    switch (threatLevel.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'from-orange-500 to-secondary-container animate-pulse shadow-[0_0_10px_rgba(255,82,92,0.4)]'
      case 'medium':
      case 'elevated':
        return 'from-yellow-500 to-orange-400'
      case 'low':
      default:
        return 'from-primary-fixed-dim to-primary'
    }
  }

  const getTextColor = () => {
    if (!isScam) return 'text-primary'
    switch (threatLevel.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'text-secondary font-bold'
      case 'medium':
      case 'elevated':
        return 'text-tertiary-fixed-dim'
      case 'low':
      default:
        return 'text-primary'
    }
  }

  return (
    <div className="space-y-3">
      {/* Labels */}
      <div className="flex justify-between items-end">
        <div>
          <span className="font-code-label text-[10px] text-on-surface-variant uppercase tracking-wider block mb-1">
            Mức độ Đe dọa
          </span>
          <span className={`text-sm font-bold ${getTextColor()}`}>
            {isScam ? `NGUY CƠ: ${threatLevel === 'High' ? 'CAO' : threatLevel === 'Medium' ? 'TRUNG BÌNH' : 'THẤP'}` : 'AN TOÀN / ỔN ĐỊNH'}
          </span>
        </div>
        <div className="text-right">
          <span className="font-code-label text-[10px] text-on-surface-variant uppercase tracking-wider block mb-0.5">
            Độ tin cậy của AI
          </span>
          <span className={`text-xl font-bold font-code-label ${getTextColor()}`}>
            {roundedValue}%
          </span>
        </div>
      </div>

      {/* Meter Bar */}
      <div className="h-3 w-full bg-surface-container-lowest border border-outline-variant/10 rounded-full overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${getMeterColor()}`}
          style={{ width: `${roundedValue}%` }}
        />
      </div>

      {/* Threshold Ticks */}
      <div className="flex justify-between px-1 text-[8px] font-code-label text-on-surface-variant uppercase tracking-widest opacity-60">
        {isScam ? (
          <>
            <span>50% Cảnh báo</span>
            <span>75% Nguy cơ</span>
            <span>100% Nguy hiểm</span>
          </>
        ) : (
          <>
            <span>50% Nghi vấn</span>
            <span>75% Khá an toàn</span>
            <span>100% Rất an toàn</span>
          </>
        )}
      </div>
    </div>
  )
}
