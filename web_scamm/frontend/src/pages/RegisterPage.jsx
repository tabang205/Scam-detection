import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [accountCreated, setAccountCreated] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const cardRef = useRef(null)

  // Compute password strength without useState/useEffect
  const { strength, strengthLabel, strengthClass } = useMemo(() => {
    if (!password) {
      return { strength: 0, strengthLabel: 'YẾU', strengthClass: 'bg-secondary' }
    }
    let score = 0
    if (password.length >= 8) score += 25
    if (/[A-Z]/.test(password)) score += 25
    if (/[0-9]/.test(password)) score += 25
    if (/[^A-Za-z0-9]/.test(password)) score += 25

    if (score <= 40) {
      return { strength: score, strengthLabel: 'YẾU', strengthClass: 'bg-secondary shadow-[0_0_8px_rgba(255,82,92,0.5)]' }
    } else if (score <= 80) {
      return { strength: score, strengthLabel: 'AN TOÀN', strengthClass: 'bg-tertiary-fixed-dim shadow-[0_0_8px_rgba(209,188,255,0.5)]' }
    } else {
      return { strength: score, strengthLabel: 'TỐI ƯU', strengthClass: 'bg-primary shadow-[0_0_8px_rgba(0,219,231,0.5)]' }
    }
  }, [password])

  // Mouse Parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!cardRef.current) return
      const moveX = (e.clientX - window.innerWidth / 2) * 0.01
      const moveY = (e.clientY - window.innerHeight / 2) * 0.01
      cardRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email || !password || isSubmitting) return

    setIsSubmitting(true)
    setErrorMsg('')

    const result = await register(name, email, password)

    if (result.success) {
      setAccountCreated(true)
      addToast('KHỞI TẠO TRẠM THÀNH CÔNG: Tài khoản đã được tạo. Đang chuyển hướng đến trang đăng nhập...', 'success')
      setTimeout(() => navigate('/login'), 1200)
    } else {
      const error = result.error || 'Đăng ký thất bại'
      setErrorMsg(error)
      addToast(error, 'error')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto relative">
      {/* Registration Card */}
      <div
        ref={cardRef}
        className="glass-panel p-8 md:p-10 rounded-2xl border border-outline-variant/30 bg-surface-container/60 shadow-[0_0_50px_rgba(0,219,231,0.15)] relative overflow-hidden transition-all duration-300 ease-out"
      >
        {/* Scanline overlay */}
        <div className="scan-line" />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-primary-container flex items-center justify-center mx-auto mb-4 neon-glow-primary">
            <span className="material-symbols-outlined text-4xl text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
              rocket_launch
            </span>
          </div>
          <h2 className="font-headline-lg font-bold text-primary tracking-tight leading-none" style={{ fontSize: '32px' }}>
            Khởi tạo Trạm mới
          </h2>
          <p className="font-code-label text-[10px] text-primary/60 uppercase tracking-widest mt-2">
            ĐĂNG KÝ BẢO VỆ AI SCAM SHIELD
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-lg bg-secondary-container/10 border border-secondary-container/20 text-secondary text-sm font-code-label flex items-center gap-2">
            <span className="material-symbols-outlined text-base">gpp_maybe</span>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" id="registration-form">
          {/* Full Name field */}
          <div className="space-y-2">
            <label className="font-code-label text-xs uppercase text-on-surface-variant tracking-wider">
              TÊN
            </label>
            <div className="relative border border-outline-variant/30 rounded-lg bg-black/40 focus-within:border-primary/50 focus-within:shadow-[0_0_15px_rgba(0,219,231,0.2)] transition-all">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                badge
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập họ và tên"
                className="w-full bg-transparent border-none py-3 pl-10 pr-4 text-on-surface font-body-md focus:outline-none focus:ring-0 placeholder:text-on-surface-variant/30"
              />
            </div>
          </div>

          {/* Email field */}
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
            <label className="font-code-label text-xs uppercase text-on-surface-variant tracking-wider">
              MẬT KHẨU
            </label>
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

          {/* Password Strength Meter */}
          {password && (
            <div className="space-y-2 p-3 bg-surface-container-low/40 rounded-lg border border-outline-variant/10">
              <div className="flex justify-between items-center text-xs font-code-label">
                <span className="text-on-surface-variant uppercase">Độ mạnh của Khóa</span>
                <span className={strength <= 40 ? 'text-secondary' : strength <= 80 ? 'text-tertiary-fixed-dim' : 'text-primary'}>
                  {strengthLabel} ({strength}%)
                </span>
              </div>
              <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${strengthClass}`}
                  style={{ width: `${strength}%` }}
                />
              </div>
            </div>
          )}

          {/* Role Checkbox / Terms */}
          <div className="flex items-center gap-2 text-xs font-code-label text-on-surface-variant">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                required
                className="w-4 h-4 rounded-sm border-outline-variant bg-surface-dim text-primary focus:ring-primary/50"
              />
              <span>TÔI CHẤP NHẬN CÁC QUY TẮC VẬN HÀNH CỦA HỆ THỐNG</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || accountCreated}
            className={`w-full py-4 rounded-lg font-bold font-code-label flex items-center justify-center gap-2 transition-all duration-300 ${
              accountCreated
                ? 'bg-green-500 text-white shadow-[0_0_25px_rgba(34,197,94,0.5)] border border-green-400'
                : 'bg-primary text-on-primary shadow-[0_0_20px_rgba(0,219,231,0.3)] hover:shadow-[0_0_30px_rgba(0,219,231,0.5)] border border-primary/20 hover:scale-[1.02] active:scale-95'
            }`}
          >
            {isSubmitting ? (
              accountCreated ? (
                <>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>ĐÃ TẠO TÀI KHOẢN</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined animate-spin">sync</span>
                  <span>ĐANG KHỞI TẠO...</span>
                </>
              )
            ) : (
              <>
                <span className="material-symbols-outlined">how_to_reg</span>
                <span>ĐĂNG KÝ</span>
              </>
            )}
          </button>
        </form>

        {/* Link to Login */}
        <div className="mt-8 pt-6 border-t border-outline-variant/15 text-center font-code-label text-xs text-on-surface-variant">
          <span>TÀI KHOẢN ĐÃ ĐƯỢC THIẾT LẬP TỪ TRƯỚC? </span>
          <Link to="/login" className="text-primary hover:underline font-bold">
            ĐĂNG NHẬP
          </Link>
        </div>
      </div>
    </div>
  )
}
