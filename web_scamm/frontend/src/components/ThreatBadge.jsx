/**
 * ThreatBadge — Colored badge for classifications (e.g. SCAM, SAFE, HIGH, LOW, etc.)
 */
export default function ThreatBadge({ type = 'safe', children, className = '' }) {
  const getStyles = () => {
    switch (type.toLowerCase()) {
      case 'scam':
      case 'high':
      case 'critical':
        return 'bg-secondary-container/10 text-secondary border-secondary-container/20'
      case 'medium':
      case 'elevated':
        return 'bg-tertiary-fixed-dim/10 text-tertiary-fixed-dim border-tertiary-fixed-dim/20'
      case 'safe':
      case 'low':
      case 'verified':
      default:
        return 'bg-primary/10 text-primary-fixed-dim border-primary/20'
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm border font-code-label text-[10px] font-bold uppercase tracking-wider ${getStyles()} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${
        type.toLowerCase() === 'scam' || type.toLowerCase() === 'high' || type.toLowerCase() === 'critical'
          ? 'bg-secondary animate-pulse'
          : type.toLowerCase() === 'medium' || type.toLowerCase() === 'elevated'
          ? 'bg-tertiary-fixed-dim'
          : 'bg-primary-fixed-dim'
      }`} />
      {children || type}
    </span>
  )
}
