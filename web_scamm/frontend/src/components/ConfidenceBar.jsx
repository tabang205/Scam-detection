/**
 * ConfidenceBar — Progress bar with custom color scales and label text.
 */
export default function ConfidenceBar({ value = 0, isScam = false, className = '' }) {
  const roundedValue = Math.round(value)

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex justify-between items-center text-xs font-code-label">
        <span className="text-on-surface-variant uppercase">Confidence</span>
        <span className={isScam ? 'text-secondary font-bold' : 'text-primary-fixed-dim'}>
          {roundedValue}%
        </span>
      </div>
      <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            isScam
              ? 'bg-gradient-to-r from-orange-500 to-secondary-container'
              : 'bg-primary-fixed-dim'
          }`}
          style={{ width: `${roundedValue}%` }}
        />
      </div>
    </div>
  )
}
