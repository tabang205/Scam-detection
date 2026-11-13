/**
 * AuthLayout — Fullscreen layout for Login and Register pages.
 * Includes atmospheric background with ambient glows, noise texture, and particle effects.
 * No sidebar. No topbar.
 */

import { useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  const particleContainerRef = useRef(null)

  useEffect(() => {
    const container = particleContainerRef.current
    if (!container) return

    const particles = []
    const PARTICLE_COUNT = 40

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const particle = document.createElement('div')
      const size = Math.random() * 3 + 1
      const posX = Math.random() * 100
      const duration = Math.random() * 15 + 10
      const delay = Math.random() * -20

      Object.assign(particle.style, {
        position: 'absolute',
        background: '#00dbe7',
        borderRadius: '50%',
        pointerEvents: 'none',
        opacity: '0.2',
        width: `${size}px`,
        height: `${size}px`,
        left: `${posX}%`,
        top: '110%',
        animation: `auth-float ${duration}s linear ${delay}s infinite`,
      })

      container.appendChild(particle)
      particles.push(particle)
    }

    return () => {
      particles.forEach((p) => p.remove())
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative">
      {/* ── Atmospheric Background ── */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-background via-[#0a0c10] to-[#1a1c20]">
        <div className="absolute inset-0 noise-bg" />
        <div ref={particleContainerRef} className="absolute inset-0" />

        {/* Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary-container/5 blur-[120px]" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-[1440px] px-4 md:px-10">
        <Outlet />
      </div>

      {/* ── Float keyframe (injected) ── */}
      <style>{`
        @keyframes auth-float {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
