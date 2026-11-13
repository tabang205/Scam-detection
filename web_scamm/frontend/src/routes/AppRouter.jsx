import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import AppLayout from '../layouts/AppLayout'
import AuthLayout from '../layouts/AuthLayout'

// Performance optimization: Lazy load route pages
const LoginPage = React.lazy(() => import('../pages/LoginPage'))
const RegisterPage = React.lazy(() => import('../pages/RegisterPage'))
const DashboardPage = React.lazy(() => import('../pages/DashboardPage'))
const DetectPage = React.lazy(() => import('../pages/DetectPage'))
const AnalyticsPage = React.lazy(() => import('../pages/AnalyticsPage'))
const HistoryPage = React.lazy(() => import('../pages/HistoryPage'))
const SettingsPage = React.lazy(() => import('../pages/SettingsPage'))

// Loading Placeholder for Suspense
function PageLoader() {
  return (
    <div className="w-full min-h-[400px] flex flex-col items-center justify-center text-primary font-code-label">
      <span className="material-symbols-outlined animate-spin text-5xl mb-2">sync</span>
      <span className="tracking-widest uppercase text-xs">Decrypting Node View...</span>
    </div>
  )
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary font-code-label">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined animate-spin text-5xl">sync</span>
          <span>LOADING SECURE TUNNEL...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Public Auth Routes ── */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* ── Protected System Routes ── */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/detect" element={<DetectPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* ── Fallback Routing ── */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
