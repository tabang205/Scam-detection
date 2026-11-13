/**
 * Skeleton — glowing layout blocks to show during asynchronous operations
 */
export default function Skeleton({ className = '', variant = 'card' }) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'text':
        return 'h-4 w-3/4 rounded bg-surface-container-highest/40'
      case 'title':
        return 'h-7 w-1/2 rounded bg-surface-container-highest/40'
      case 'table-row':
        return 'h-12 w-full rounded bg-surface-container-highest/30'
      case 'chart':
        return 'h-64 w-full rounded-xl bg-surface-container-highest/35'
      case 'card':
      default:
        return 'h-32 w-full rounded-xl bg-surface-container-highest/40'
    }
  }

  return (
    <div
      className={`animate-pulse border border-outline-variant/5 shadow-[0_0_15px_rgba(0,0,0,0.1)] ${getVariantStyles()} ${className}`}
    />
  )
}
