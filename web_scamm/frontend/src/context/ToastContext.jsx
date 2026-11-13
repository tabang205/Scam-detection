import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Toast container overlay */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border flex items-start gap-3 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300 ${
              toast.type === 'error'
                ? 'bg-secondary-container/10 border-secondary-container/20 text-secondary'
                : toast.type === 'success'
                ? 'bg-primary-container/10 border-primary-container/20 text-primary-fixed-dim'
                : 'bg-surface-container-high/60 border-outline-variant/20 text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-lg mt-0.5">
              {toast.type === 'error' ? 'report' : toast.type === 'success' ? 'check_circle' : 'info'}
            </span>
            <div className="flex-1">
              <p className="font-code-label text-[10px] uppercase tracking-wider font-bold">
                {toast.type === 'error' ? 'Alert Threat' : toast.type === 'success' ? 'Success Action' : 'Telemetry Info'}
              </p>
              <p className="text-sm font-body-md mt-0.5 opacity-90">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-on-surface-variant hover:text-on-surface opacity-60 hover:opacity-100 transition-opacity"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
