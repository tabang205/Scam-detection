/**
 * AnalyticsPage — System Intelligence dashboard wired to live database & model metrics.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyticsService } from '../services/api'
import GlassPanel from '../components/GlassPanel'
import ThreatBadge from '../components/ThreatBadge'

export default function AnalyticsPage() {
  const navigate = useNavigate()
  const [days, setDays] = useState(7)
  const [stats, setStats] = useState({
    total_scanned: 0,
    scams_detected: 0,
    avg_confidence: 0,
    threat_level: 'Low',
    accuracy: 0,
    scan_latency: 0,
    f1_score: 0,
    model_size_mb: 0,
    trend_data: [],
    daily_labels: [],
    hourly_data: [],
    hourly_labels: [],
    keyword_stats: [],
    recent_threats: [],
  })
  const [loading, setLoading] = useState(true)

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(stats, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `scam_shield_analytics_${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    document.body.removeChild(downloadAnchor)
  }

  useEffect(() => {
    let active = true
    const fetchStats = async () => {
      setLoading(true)
      try {
        const data = await analyticsService.getAnalytics(days)
        if (active) {
          setStats(data)
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err)
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchStats()
    return () => {
      active = false
    }
  }, [days])

  const getTrendBars = () => {
    const apiData = days === 1 ? (stats?.hourly_data || []) : (stats?.trend_data || [])
    const labels = days === 1 ? (stats?.hourly_labels || []) : (stats?.daily_labels || [])
    if (!apiData.length) {
      return Array.from({ length: 7 }, (_, i) => ({ pct: 6, count: 0, label: `#${i + 1}` }))
    }
    const maxVal = Math.max(...apiData, 0)
    return apiData.map((val, i) => ({
      pct: maxVal > 0 ? Math.max(10, (val / maxVal) * 85 + 10) : 6,
      count: val,
      label: labels[i] || `#${i + 1}`,
    }))
  }

  const recentThreats = stats.recent_threats || []
  const keywordStats = stats.keyword_stats || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-headline-lg text-primary font-bold tracking-tight">Trí tuệ Hệ thống</h2>
          <p className="text-on-surface-variant max-w-xl">
            Dữ liệu đo lường hiệu suất mô hình và các vectơ đe dọa thực tế trong cơ sở dữ liệu.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportJSON}
            className="glass-panel px-6 py-2.5 rounded-lg font-code-label hover:border-primary/50 transition-all cursor-pointer"
          >
            XUẤT_DỮ_LIỆU.JSON
          </button>
          <button
            onClick={() => navigate('/detect')}
            className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-lg font-bold neon-glow-primary hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          >
            CHẠY QUÉT MỚI
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-primary font-code-label">
          <span className="material-symbols-outlined animate-spin text-4xl mb-2">sync</span>
          ĐANG TẢI DỮ LIỆU ĐO LƯỜNG HỆ THỐNG...
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* Trend Chart */}
          <GlassPanel className="col-span-12 lg:col-span-8 p-6 overflow-hidden relative">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="font-code-label text-primary uppercase tracking-widest">Phân tích xu hướng lừa đảo</p>
                <h3 className="text-xl font-bold">
                  {days === 1 ? 'Hoạt động 24 giờ qua' : days === 7 ? 'Hoạt động 7 ngày qua' : 'Hoạt động 30 ngày qua'}
                </h3>
              </div>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="bg-surface-container border border-outline-variant/20 text-sm rounded-lg px-4 py-1.5 focus:ring-1 focus:ring-primary/50 cursor-pointer"
              >
                <option value={1}>24 Giờ qua</option>
                <option value={7}>7 Ngày qua</option>
                <option value={30}>30 Ngày qua</option>
              </select>
            </div>
            <div className="h-[300px] w-full relative flex items-end justify-between px-2 gap-2">
              {getTrendBars().map((bar, i) => (
                <div
                  key={i}
                  className="w-full h-full flex flex-col justify-end items-center gap-2 group cursor-help"
                  title={`${bar.label}: ${bar.count} lượt quét`}
                >
                  <div className="w-full flex-1 flex items-end relative">
                    <div
                      className={`w-full rounded-t-sm transition-all relative ${
                        bar.count > 0 && bar.pct >= 80 ? 'bg-secondary-container/25' : 'bg-primary/20'
                      }`}
                      style={{ height: `${bar.pct}%` }}
                    >
                      <div className={`absolute bottom-0 left-0 right-0 h-1 ${
                        bar.count > 0 && bar.pct >= 80 ? 'bg-secondary-container neon-glow-secondary' : 'bg-primary neon-glow-primary'
                      }`} />
                      {bar.count > 0 && bar.pct >= 80 && (
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-code-label text-[10px] text-error font-bold whitespace-nowrap">
                          {bar.count} LƯỢT
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-code-label text-[10px] text-on-surface-variant truncate">{bar.label}</span>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Detection Precision */}
          <GlassPanel className="col-span-12 lg:col-span-4 p-6 flex flex-col justify-between relative">
            <div className="absolute top-0 right-0 p-6 opacity-20 pointer-events-none">
              <span className="material-symbols-outlined text-5xl">auto_awesome</span>
            </div>
            <div>
              <p className="font-code-label text-primary uppercase tracking-widest mb-2">Độ chính xác Benchmark</p>
              <h3 className="text-4xl font-extrabold text-primary mb-1" style={{ fontFamily: 'Geist' }}>
                {stats.accuracy > 0 ? stats.accuracy : '—'}
                {stats.accuracy > 0 && <span className="text-lg opacity-60">%</span>}
              </h3>
              <p className="font-body-sm text-on-surface-variant">
                Tổng lượt quét trong kỳ: <span className="text-on-surface font-semibold">{stats.total_scanned}</span> ({stats.scams_detected} cảnh báo lừa đảo).
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-outline-variant/30">
              <div className="flex items-center justify-between mb-2">
                <span className="font-body-sm">Độ tin cậy trung bình</span>
                <span className="font-code-label text-primary">{stats.avg_confidence}%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary neon-glow-primary transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, stats.avg_confidence || 0))}%` }}
                />
              </div>
            </div>
          </GlassPanel>

          {/* Threat Activity Log */}
          <GlassPanel className="col-span-12 lg:col-span-5 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Nhật ký hoạt động đe dọa</h3>
              <span className="flex items-center text-error font-code-label text-[10px] uppercase tracking-widest">
                <span className="w-2 h-2 bg-error rounded-full animate-pulse mr-2" />
                CSDL Trực tiếp
              </span>
            </div>
            {recentThreats.length === 0 ? (
              <div className="py-12 text-center font-code-label text-xs text-on-surface-variant">
                Chưa phát hiện tin nhắn lừa đảo nào trong khoảng thời gian đã chọn.
              </div>
            ) : (
              <div className="space-y-4">
                {recentThreats.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate('/detect', { state: { message: item.message } })}
                    className={`p-3 rounded-r-lg flex items-center justify-between gap-3 hover:bg-surface-container-high transition-all cursor-pointer ${
                      item.threat_level === 'High'
                        ? 'threat-accent bg-surface-container/40'
                        : 'border-l-4 border-primary bg-surface-container/40'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-body-sm font-bold truncate">{item.message}</p>
                      <p className="font-code-label text-[10px] opacity-60">
                        NGUỒN: {item.source} | {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                    <ThreatBadge type="Scam">
                      {item.confidence}%
                    </ThreatBadge>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>

          {/* Keyword Frequency Matrix */}
          <GlassPanel className="col-span-12 lg:col-span-7 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Ma trận tần suất từ khóa</h3>
              <p className="font-code-label text-[10px] text-primary">DỮ_LIỆU_THỰC_TẾ</p>
            </div>
            {keywordStats.length === 0 ? (
              <div className="flex-1 flex items-center justify-center py-12 font-code-label text-xs text-on-surface-variant">
                Chưa có từ khóa lừa đảo nào được thống kê trong kỳ này.
              </div>
            ) : (
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {keywordStats.map((kw, i) => (
                  <div
                    key={kw.keyword}
                    className={`rounded-sm flex flex-col items-center justify-center p-4 transition-all ${
                      i === 0
                        ? 'bg-secondary-container/40 border border-secondary-container/50'
                        : i === 1
                        ? 'bg-primary/30 border border-primary/40'
                        : 'bg-primary/15 border border-primary/25'
                    }`}
                  >
                    <span className={`font-bold text-center break-words ${i === 0 ? 'text-xl text-secondary' : 'text-base text-primary'}`}>
                      {kw.keyword.toUpperCase()}
                    </span>
                    <span className="font-code-label text-[10px] text-on-surface-variant mt-1">
                      {kw.count} lần ({kw.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>

          {/* Bottom Row: Performance Cards */}
          {[
            { icon: 'speed', label: 'Độ trễ quét', value: stats.scan_latency > 0 ? `${stats.scan_latency} ms` : 'Chưa đo' },
            { icon: 'track_changes', label: 'Điểm F1-Score', value: stats.f1_score > 0 ? `${stats.f1_score}%` : 'Chưa đo', fill: true },
            { icon: 'storage', label: 'Dung lượng Model', value: stats.model_size_mb > 0 ? `${stats.model_size_mb} MB` : 'Chưa đo' },
            {
              icon: 'warning',
              label: 'Mức độ đe dọa',
              value: stats.threat_level === 'High' ? 'CAO' : stats.threat_level === 'Medium' ? 'TRUNG BÌNH' : 'THẤP',
              isDanger: stats.threat_level === 'High',
            },
          ].map((card, i) => (
            <GlassPanel key={i} className="col-span-12 md:col-span-3 p-6 relative overflow-hidden">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                  card.isDanger ? 'border-secondary-container/30' : 'border-primary/30'
                }`}>
                  <span
                    className={`material-symbols-outlined ${card.isDanger ? 'text-secondary-container' : 'text-primary'}`}
                    style={card.fill ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {card.icon}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-code-label uppercase text-on-surface-variant">{card.label}</p>
                  <p className={`text-xl font-bold ${card.isDanger ? 'text-secondary' : ''}`}>{card.value}</p>
                </div>
              </div>
            </GlassPanel>
          ))}
        </div>
      )}
    </div>
  )
}
