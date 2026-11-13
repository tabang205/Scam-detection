import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function LoginPage() {
  const { login } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [accessGranted, setAccessGranted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  
  const cardRef = useRef(null)

  // Mouse Parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!cardRef.current) return
      const moveX = (e.clientX - window.innerWidth / 2) * 0.015
      const moveY = (e.clientY - window.innerHeight / 2) * 0.015
      cardRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password || isSubmitting) return

    setIsSubmitting(true)
    setErrorMsg('')

    const result = await login(email, password)

    if (result.success) {
      setAccessGranted(true)
      addToast('QUYỀN TRUY CẬP ĐÃ ĐƯỢC CẤP: Xác thực trạm thành công.', 'success')
      setTimeout(() => navigate('/dashboard'), 800)
    } else {
      const error = result.error || 'Truy cập bị từ chối: Thông tin đăng nhập không hợp lệ'
      setErrorMsg(error)
      addToast(error, 'error')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto relative">
      {/* Login Card */}
      <div
        ref={cardRef}
        className="glass-panel p-8 md:p-10 rounded-2xl border border-outline-variant/30 bg-surface-container/60 shadow-[0_0_50px_rgba(0,219,231,0.15)] relative overflow-hidden transition-all duration-300 ease-out"
      >
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-primary/10 blur-xl pointer-events-none" />

        {/* Brand/Logo Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-primary-container flex items-center justify-center mx-auto mb-4 neon-glow-primary">
            <span className="material-symbols-outlined text-4xl text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield
            </span>
          </div>
          <h2 className="font-headline-lg font-bold text-primary tracking-tight leading-none" style={{ fontSize: '32px' }}>
            Scam Shield
          </h2>
          <p className="font-code-label text-[10px] text-primary/60 uppercase tracking-widest mt-2">
            ĐĂNG NHẬP TRẠM PHÂN TÍCH AI
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-lg bg-secondary-container/10 border border-secondary-container/20 text-secondary text-sm font-code-label flex items-center gap-2">
            <span className="material-symbols-outlined text-base">gpp_maybe</span>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email/Username field */}
          <div className="space-y-2">
            <label className="font-code-label text-xs uppercase text-on-surface-variant tracking-wider">
              EMAIL
            </label>
            <div className="relative border border-outline-variant/30 rounded-lg bg-black/40 focus-within:border-primary/50 focus-within:shadow-[0_0_15px_rgba(0,219,231,0.2)] transition-all">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                alternate_email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập địa chỉ email của bạn"
                className="w-full bg-transparent border-none py-3 pl-10 pr-4 text-on-surface font-body-md focus:outline-none focus:ring-0 placeholder:text-on-surface-variant/30"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-code-label text-xs uppercase text-on-surface-variant tracking-wider">
                MẬT KHẨU
              </label>
            </div>
            <div className="relative border border-outline-variant/30 rounded-lg bg-black/40 focus-within:border-primary/50 focus-within:shadow-[0_0_15px_rgba(0,219,231,0.2)] transition-all">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                lock
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full bg-transparent border-none py-3 pl-10 pr-4 text-on-surface font-body-md focus:outline-none focus:ring-0 placeholder:text-on-surface-variant/30"
              />
            </div>
          </div>

          {/* Session note */}
          <div className="flex items-center justify-between text-xs font-code-label text-on-surface-variant">
            <span>PHIÊN ĐĂNG NHẬP ĐƯỢC BẢO VỆ BỞI JWT (24H)</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || accessGranted}
            className={`w-full py-4 rounded-lg font-bold font-code-label flex items-center justify-center gap-2 transition-all duration-300 ${
              accessGranted
                ? 'bg-green-500 text-white shadow-[0_0_25px_rgba(34,197,94,0.5)] border border-green-400'
                : 'bg-primary text-on-primary shadow-[0_0_20px_rgba(0,219,231,0.3)] hover:shadow-[0_0_30px_rgba(0,219,231,0.5)] border border-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-80'
            }`}
          >
            {isSubmitting ? (
              accessGranted ? (
                <>
                  <span className="material-symbols-outlined animate-pulse">check_circle</span>
                  <span>ĐÃ CẤP QUYỀN TRUY CẬP</span>
                </>
              ) : (
                <>
                  <svg className="animate-spin h-5 w-5 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>ĐANG XÁC THỰC...</span>
                </>
              )
            ) : (
              <>
                <span className="material-symbols-outlined">vpn_key</span>
                <span>ĐĂNG NHẬP</span>
              </>
            )}
          </button>
        </form>

        {/* Link to Register */}
        <div className="mt-8 pt-6 border-t border-outline-variant/15 text-center font-code-label text-xs text-on-surface-variant">
          <span>YÊU CẦU TÀI KHOẢN MỚI? </span>
          <Link to="/register" className="text-primary hover:underline font-bold">
            KHỞI TẠO TÀI KHOẢN MỚI
          </Link>
        </div>
      </div>
    </div>
  )
}
