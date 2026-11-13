/**
 * GlassPanel — Reusable card panel with glassmorphism styling
 */
export default function GlassPanel({ children, className = '', onClick, style = {} }) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={`glass-panel p-6 rounded-xl border border-outline-variant/10 bg-surface-container/60 backdrop-blur-xl transition-all duration-300 hover:border-primary/20 ${className} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {children}
    </div>
  )
}
