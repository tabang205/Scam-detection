/**
 * AppLayout — Shared layout for authenticated pages.
 * Fixed sidebar (desktop) + Topbar + Mobile bottom nav.
 * Exactly matches the HTML prototype structure.
 */

import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { path: '/detect', icon: 'radar', label: 'Detect' },
  { path: '/analytics', icon: 'insights', label: 'Analytics' },
  { path: '/history', icon: 'history', label: 'History' },
  { path: '/settings', icon: 'settings', label: 'Settings' },
]

export default function AppLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* ── Noise Background ── */}
      <div className="fixed inset-0 noise-bg z-[-1]" />

      {/* ── SIDEBAR (Desktop) ── */}
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 border-r border-outline-variant/10 bg-surface-container/60 backdrop-blur-xl z-50 shadow-[0_0_15px_rgba(0,219,231,0.05)]"
        style={{ paddingTop: '40px', paddingBottom: '40px' }}
      >
        {/* Brand */}
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center neon-glow-primary">
            <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield
            </span>
          </div>
          <div>
            <h1 className="font-headline-lg font-bold text-primary tracking-tight leading-none" style={{ fontSize: '28px', lineHeight: '32px' }}>
              Scam Shield
            </h1>
            <p className="font-code-label text-primary/60 uppercase tracking-widest mt-1">
              Vigilance AI
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  isActive
                     ? 'text-primary border-r-4 border-primary bg-primary/10 font-bold'
                     : 'text-on-surface-variant hover:text-primary hover:bg-primary/5 hover:shadow-[0_0_10px_rgba(0,219,231,0.2)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className="material-symbols-outlined"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                  <span className="font-code-label">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-4 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/5 transition-all duration-300 cursor-pointer"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-code-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── TOPBAR ── */}
      <header className="flex items-center justify-between px-6 h-20 fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] z-40 bg-surface/40 backdrop-blur-lg border-b border-outline-variant/20">
        {/* Search */}
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm mối đe dọa, nhật ký, hoặc người dùng..."
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg py-2 pl-10 pr-4 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50 font-body-sm transition-all"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          {/* Scanner Status */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary-fixed-dim pulsing-dot" />
            <span className="font-code-label text-primary/80 uppercase">Máy quét Hoạt động</span>
          </div>

          {/* Notifications */}
          <button className="text-on-surface-variant hover:text-primary transition-all relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-secondary rounded-full" />
          </button>

          {/* Sensors */}
          <button className="text-on-surface-variant hover:text-primary transition-all">
            <span className="material-symbols-outlined">sensors</span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-outline-variant/20">
            <div className="text-right hidden sm:block">
              <p className="font-code-label font-bold text-on-surface" style={{ fontSize: '12px' }}>{user?.name || 'Alex Chen'}</p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">{user?.role || 'Trưởng bộ phận Bảo mật'}</p>
            </div>
            <div className="w-10 h-10 rounded-full border border-primary/20 p-0.5 bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="pt-24 pb-12 px-6 md:px-10 md:ml-64 min-h-screen">
        <div className="max-w-[1440px] mx-auto">
          <Outlet />
        </div>
      </main>

      {/* ── MOBILE NAV (Bottom) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container/80 backdrop-blur-xl border-t border-outline-variant/20 flex items-center justify-around z-50">
        {navItems.slice(0, 2).map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-[10px]">{item.label.slice(0, 4)}</span>
          </NavLink>
        ))}
        <NavLink to="/detect" className="w-12 h-12 -mt-8 bg-primary rounded-full flex items-center justify-center text-on-primary shadow-lg neon-glow-primary">
          <span className="material-symbols-outlined">shield</span>
        </NavLink>
        {navItems.slice(2, 4).map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-[10px]">{item.label.slice(0, 5)}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
