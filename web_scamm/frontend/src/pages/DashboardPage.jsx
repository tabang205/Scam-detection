/**
 * DashboardPage — Security Overview
 * Uses real backend data for scanned message counts, threats, and lists.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyticsService, historyService } from '../services/api'
import GlassPanel from '../components/GlassPanel'
import ThreatBadge from '../components/ThreatBadge'
import Skeleton from '../components/Skeleton'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [trendMode, setTrendMode] = useState('hour')
  const [stats, setStats] = useState({
    total_scanned: 0,
    scams_detected: 0,
    avg_confidence: 0,
    threat_level: 'Low',
    accuracy: 0,
    trend_data: [],
    daily_labels: [],
    hourly_data: [],
    hourly_labels: [],
    keyword_stats: [],
  })
  const [recentLogs, setRecentLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const getTrendBars = () => {
    const rawValues = trendMode === 'hour' ? (stats?.hourly_data || []) : (stats?.trend_data || [])
    const labels = trendMode === 'hour' ? (stats?.hourly_labels || []) : (stats?.daily_labels || [])
    if (!rawValues.length) {
      return Array.from({ length: trendMode === 'hour' ? 6 : 7 }, (_, i) => ({ pct: 6, count: 0, label: `#${i + 1}` }))
    }
    const maxVal = Math.max(...rawValues, 0)
    return rawValues.map((val, i) => ({
      pct: maxVal > 0 ? Math.max(8, (val / maxVal) * 85 + 10) : 6,
      count: val,
      label: labels[i] || `#${i + 1}`,
    }))
  }

  const handleDownloadReport = () => {
    const payload = {
      generated_at: new Date().toISOString(),
      summary: stats,
      recent_scans: recentLogs,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `scam_shield_report_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    let active = true
    const loadDashboardData = async () => {
      try {
        const [statsData, historyData] = await Promise.all([
          analyticsService.getAnalytics(7),
          historyService.getHistory(1, 5),
        ])
        if (active) {
          setStats(statsData)
          setRecentLogs(historyData.items)
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadDashboardData()
    return () => {
      active = false
    }
  }, [])

  const accuracyLabel = stats.accuracy > 0 ? `${stats.accuracy}%` : 'Chưa đo'
  const safeCount = Math.max(0, (stats.total_scanned || 0) - (stats.scams_detected || 0))
  const scamPct = stats.total_scanned > 0 ? Math.round((stats.scams_detected / stats.total_scanned) * 100) : 0
  const safePct = stats.total_scanned > 0 ? 100 - scamPct : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-10">
        <h2 className="font-headline-lg text-primary mb-2">Tổng quan Bảo mật</h2>
        <p className="font-body-md text-on-surface-variant max-w-xl">
          Phân tích luồng truyền thông thời gian thực với XLM-RoBERTa. {stats.accuracy > 0 ? `Độ chính xác đo trên tập kiểm thử đạt ${stats.accuracy}%.` : 'Hệ thống sẵn sàng giám sát mọi kênh tin nhắn.'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <GlassPanel className="flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="font-code-label text-on-surface-variant uppercase tracking-widest">Tin nhắn đã quét</span>
            <span className="material-symbols-outlined text-primary/50">mark_email_read</span>
          </div>
          <div>
            {loading ? (
              <Skeleton variant="title" className="mb-2" />
            ) : (
              <p className="text-[32px] font-bold text-on-surface leading-none mb-1" style={{ fontFamily: 'Geist' }}>
                {stats.total_scanned.toLocaleString()}
              </p>
            )}
            <p className="font-code-label text-primary flex items-center gap-1 text-[11px]">
              <span className="material-symbols-outlined text-sm">trending_up</span> +12% so với 24h qua
            </p>
          </div>
        </GlassPanel>

        <GlassPanel className="flex flex-col justify-between h-36 border-l-4 border-secondary-container">
          <div className="flex justify-between items-start">
            <span className="font-code-label text-on-surface-variant uppercase tracking-widest">Phát hiện lừa đảo</span>
            <span className="material-symbols-outlined text-secondary/50">warning</span>
          </div>
          <div>
            {loading ? (
              <Skeleton variant="title" className="mb-2" />
            ) : (
              <p className="text-[32px] font-bold text-secondary leading-none mb-1" style={{ fontFamily: 'Geist' }}>
                {stats.scams_detected.toLocaleString()}
              </p>
            )}
            <p className="font-code-label text-secondary flex items-center gap-1 text-[11px]">
              <span className="material-symbols-outlined text-sm">error</span> Đã chặn mối đe dọa khẩn cấp
            </p>
          </div>
        </GlassPanel>

        <GlassPanel className="flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="font-code-label text-on-surface-variant uppercase tracking-widest">Mức độ Đe dọa</span>
            <span className="material-symbols-outlined text-primary/50">security</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              {loading ? (
                <Skeleton variant="title" className="w-20" />
              ) : (
                <p className="text-[32px] font-bold text-on-surface leading-none" style={{ fontFamily: 'Geist' }}>
                  {stats.threat_level === 'High' ? 'CAO' : stats.threat_level === 'Medium' ? 'TRUNG BÌNH' : 'THẤP'}
                </p>
              )}
              <div className="h-1 flex-1 bg-surface-variant rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    stats.threat_level === 'High' ? 'bg-secondary' : 'bg-primary-fixed-dim'
                  }`}
                  style={{ width: stats.threat_level === 'High' ? '75%' : '15%' }}
                />
              </div>
            </div>
            <p className="font-code-label text-on-surface-variant text-[11px]">Hệ thống ổn định &amp; an toàn</p>
          </div>
        </GlassPanel>

        <GlassPanel className="flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="font-code-label text-on-surface-variant uppercase tracking-widest">Độ chính xác AI</span>
            <span className="material-symbols-outlined text-primary/50">psychology</span>
          </div>
          <div>
            {loading ? (
              <Skeleton variant="title" className="mb-2" />
            ) : (
              <p className="text-[32px] font-bold text-on-surface leading-none mb-1" style={{ fontFamily: 'Geist' }}>{accuracyLabel}</p>
            )}
            <p className="font-code-label text-primary-fixed-dim text-[11px]">Động cơ XLM-RoBERTa đa ngôn ngữ</p>
          </div>
        </GlassPanel>
      </div>

      {/* Scan Activity + Category Split */}
      <div className="grid grid-cols-12 gap-6">
        <GlassPanel className="col-span-12 lg:col-span-8 p-8 min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-headline-lg text-on-surface">Hoạt động Quét</h3>
              <p className="font-body-sm text-on-surface-variant">
                {trendMode === 'hour' ? 'Lưu lượng quét 24 giờ gần nhất' : 'Lưu lượng quét 7 ngày gần nhất'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTrendMode('hour')}
                className={`px-3 py-1 font-code-label rounded-sm cursor-pointer transition-colors ${
                  trendMode === 'hour'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-on-surface-variant hover:bg-surface-variant'
                }`}
              >
                Theo giờ
              </button>
              <button
                onClick={() => setTrendMode('day')}
                className={`px-3 py-1 font-code-label rounded-sm cursor-pointer transition-colors ${
                  trendMode === 'day'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-on-surface-variant hover:bg-surface-variant'
                }`}
              >
                Theo ngày
              </button>
            </div>
          </div>
          <div className="w-full h-[280px] relative flex items-end gap-2">
            {getTrendBars().map((bar, i) => (
              <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-2 group" title={`${bar.label}: ${bar.count} lượt quét`}>
                <div className="w-full flex-1 flex items-end">
                  <div
                    className={`w-full rounded-t transition-all duration-500 ${
                      bar.count > 0 && bar.pct > 70 ? 'bg-primary/60 border-t border-primary neon-glow-primary' : 'bg-primary/20'
                    }`}
                    style={{ height: `${bar.pct}%` }}
                  />
                </div>
                <span className="font-code-label text-[10px] text-on-surface-variant truncate">{bar.label}</span>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="col-span-12 lg:col-span-4 p-8 flex flex-col justify-between">
          <div>
            <h3 className="font-headline-lg text-on-surface mb-2">Phân loại Đe dọa</h3>
            <p className="font-body-sm text-on-surface-variant mb-8">Tỷ lệ kết quả quét thực tế từ CSDL</p>

            <div className="relative flex items-center justify-center py-4">
              <div className="w-44 h-44 rounded-full border-[12px] border-primary/10 relative flex items-center justify-center">
                <div className="text-center">
                  <p className="text-[24px] font-bold text-on-surface" style={{ fontFamily: 'Geist' }}>
                    {loading ? (
                      <span className="animate-pulse opacity-50">...</span>
                    ) : (
                      stats.scams_detected >= 1000
                        ? `${(stats.scams_detected / 1000).toFixed(1)}k`
                        : stats.scams_detected
                    )}
                  </p>
                  <p className="font-code-label text-[10px] text-on-surface-variant uppercase">Lừa đảo phát hiện</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-6">
            {[
              { color: 'bg-secondary-container', label: 'Tin nhắn Lừa đảo', pct: `${scamPct}% (${stats.scams_detected})` },
              { color: 'bg-primary-fixed-dim', label: 'Tin nhắn An toàn', pct: `${safePct}% (${safeCount})` },
              { color: 'bg-outline', label: 'Độ tin cậy TB', pct: `${stats.avg_confidence || 0}%` },
            ].map((cat) => (
              <div key={cat.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                  <span className="font-code-label text-on-surface">{cat.label}</span>
                </div>
                <span className="font-code-label text-on-surface-variant">{cat.pct}</span>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>

      {/* Live Threat Log */}
      <GlassPanel className="mt-6 p-8 overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-headline-lg text-on-surface">Nhật ký Quét Gần đây</h3>
            <p className="font-body-sm text-on-surface-variant">Các lượt phân tích mới nhất được lưu trong SQLite</p>
          </div>
          <button onClick={handleDownloadReport} className="font-code-label text-primary hover:underline cursor-pointer">Tải báo cáo</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant/30 font-code-label text-on-surface-variant uppercase tracking-widest text-xs">
                <th className="pb-4 font-normal">Thời gian</th>
                <th className="pb-4 font-normal">Nội dung tin nhắn mẫu</th>
                <th className="pb-4 font-normal">Phân loại</th>
                <th className="pb-4 font-normal">Độ tin cậy</th>
                <th className="pb-4 font-normal">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="hover:bg-primary/5 transition-colors">
                    <td className="py-5 font-code-label text-xs">
                      <Skeleton variant="text" className="w-16" />
                    </td>
                    <td className="py-5 font-body-md text-on-surface truncate max-w-xs">
                      <Skeleton variant="text" className="w-48" />
                    </td>
                    <td className="py-5">
                      <Skeleton variant="text" className="w-16 h-6 rounded" />
                    </td>
                    <td className="py-5">
                      <Skeleton variant="text" className="w-24" />
                    </td>
                    <td className="py-5">
                      <Skeleton variant="text" className="w-16 h-6 rounded" />
                    </td>
                  </tr>
                ))
              ) : recentLogs.length > 0 ? (
                recentLogs.map((row) => (
                  <tr 
                    key={row.id} 
                    onClick={() => navigate('/detect', { state: { message: row.message } })}
                    className="hover:bg-primary/10 transition-colors cursor-pointer group"
                    title="Nhấp để phân tích lại tin nhắn này"
                  >
                    <td className="py-5 font-code-label text-xs">
                      {new Date(row.created_at).toLocaleTimeString()}
                    </td>
                    <td className="py-5 max-w-xs truncate font-body-md text-on-surface">
                      "{row.message}"
                    </td>
                    <td className="py-5">
                      <ThreatBadge type={row.prediction}>
                        {row.prediction === 'Scam' ? 'Lừa đảo' : 'An toàn'}
                      </ThreatBadge>
                    </td>
                    <td className="py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                          <div
                            className={`h-full ${row.prediction === 'Scam' ? 'bg-secondary' : 'bg-primary-fixed-dim'}`}
                            style={{ width: `${row.confidence}%` }}
                          />
                        </div>
                        <span className={`font-code-label ${row.prediction === 'Scam' ? 'text-secondary' : 'text-primary-fixed-dim'}`}>
                          {row.confidence}%
                        </span>
                      </div>
                    </td>
                    <td className="py-5">
                      <span className={`px-3 py-1 rounded-sm font-code-label text-[10px] uppercase ${
                        row.prediction === 'Scam'
                          ? 'bg-secondary-container/10 text-secondary border border-secondary-container/20'
                          : 'bg-primary/10 text-primary border-primary/20'
                      }`}>
                        {row.prediction === 'Scam' ? 'ĐÃ CHẶN' : 'ĐÃ XÁC THỰC'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center font-code-label text-on-surface-variant">
                    Chưa có lượt quét nào được ghi nhận. Hãy phân tích tin nhắn đầu tiên tại mục Quét Tin Nhắn.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  )
}
