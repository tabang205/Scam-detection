/**
 * HistoryPage — Activity Logs with live database searching, filtering, and pagination.
 * Integrated with the historyService API and reusable UI components.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { historyService, analyticsService } from '../services/api'
import GlassPanel from '../components/GlassPanel'
import ThreatBadge from '../components/ThreatBadge'
import ConfidenceBar from '../components/ConfidenceBar'

export default function HistoryPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [historyItems, setHistoryItems] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [totalScams, setTotalScams] = useState(0)
  const [avgConfidence, setAvgConfidence] = useState(0)
  const [loading, setLoading] = useState(true)

  const handleExportCSV = () => {
    if (historyItems.length === 0) return
    const headers = ['ID', 'Source', 'Message', 'Prediction', 'Confidence', 'Threat Level', 'Keywords', 'Created At']
    const rows = historyItems.map(item => [
      item.id,
      item.source,
      `"${item.message.replace(/"/g, '""')}"`,
      item.prediction,
      `${item.confidence}%`,
      item.threat_level,
      `"${item.keywords.join(', ')}"`,
      item.created_at
    ])
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `scam_shield_history_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Fetch scan history from SQLite database
  useEffect(() => {
    let active = true
    const fetchHistory = async () => {
      setLoading(true)
      try {
        const [data, analyticsData] = await Promise.all([
          historyService.getHistory(page, limit, filter, search, sort),
          analyticsService.getAnalytics(30),
        ])
        if (active) {
          setHistoryItems(data.items)
          setTotalItems(data.total)
          setTotalScams(data.scam_total ?? analyticsData.scams_detected)
          setAvgConfidence(analyticsData.avg_confidence)
        }
      } catch (err) {
        console.error('Failed to load history:', err)
      } finally {
        if (active) setLoading(false)
      }
    }

    // Small delay to debounce search input typing
    const delayDebounce = setTimeout(() => {
      fetchHistory()
    }, 300)

    return () => {
      active = false
      clearTimeout(delayDebounce)
    }
  }, [page, filter, limit, search, sort])

  // Reset page to 1 when filter changes
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
    setPage(1)
  }

  // Reset page to 1 when search changes
  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const totalPages = Math.ceil(totalItems / limit) || 1
  const startEntry = (page - 1) * limit + 1
  const endEntry = Math.min(page * limit, totalItems)

  const getSourceIcon = (source) => {
    switch (source?.toLowerCase()) {
      case 'sms':
        return 'chat'
      case 'email':
        return 'mail'
      case 'whatsapp':
      case 'messenger':
      case 'telegram':
        return 'chat_bubble'
      default:
        return 'database'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h2 className="font-headline-lg text-on-surface flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-4xl">history</span>
            Nhật ký Hoạt động
          </h2>
          <p className="text-on-surface-variant mt-1">Xem xét và phân tích kết quả quét tin nhắn trong 30 ngày qua.</p>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex bg-surface-container-low rounded-lg p-1 border border-outline-variant/20">
            {['all', 'scam', 'safe'].map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`px-4 py-1.5 rounded-md font-code-label transition-all cursor-pointer ${
                  filter === f
                    ? 'bg-primary text-on-primary font-bold shadow-[0_0_10px_rgba(0,219,231,0.2)]'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {f === 'all' ? 'Tất cả nhật ký' : f === 'scam' ? 'Chỉ Lừa đảo' : 'Chỉ An toàn'}
              </button>
            ))}
          </div>
          <button 
            onClick={handleExportCSV}
            disabled={historyItems.length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-primary-container text-on-primary-container rounded-lg font-bold hover:scale-105 active:scale-95 transition-all neon-glow-primary cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Xuất CSV
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'TỔNG SỐ BẢN GHI', value: totalItems.toLocaleString(), icon: 'database', barClass: 'bg-primary/50', textClass: 'text-on-surface' },
          { label: 'MỐI ĐE DỌA ĐÃ CHẶN', value: totalScams.toLocaleString(), icon: 'security', barClass: 'bg-secondary/50', textClass: 'text-secondary' },
          { label: 'ĐỘ TIN CẬY TRUNG BÌNH', value: avgConfidence > 0 ? `${avgConfidence.toFixed(1)}%` : '—', icon: 'analytics', barClass: 'bg-primary-fixed-dim/50', textClass: 'text-primary-fixed-dim' },
          { label: 'TRẠNG THÁI DỮ LIỆU', value: 'LIVE', icon: 'dns', barClass: 'bg-tertiary-fixed-dim/50', textClass: 'text-on-surface', showStatus: true },
        ].map((stat) => (
          <GlassPanel key={stat.label} className="relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1 h-full ${stat.barClass}`} />
            <p className="font-code-label text-on-surface-variant">{stat.label}</p>
            <p className={`font-display-lg mt-2 ${stat.textClass}`}
              style={{ fontSize: '48px' }}>
              {stat.value}
            </p>
            {stat.showStatus && (
              <div className="flex items-center gap-2 text-primary-fixed-dim mt-1">
                <span className="w-2 h-2 rounded-full bg-primary-fixed-dim pulsing-dot" />
                <span className="text-xs">Hệ thống ổn định</span>
              </div>
            )}
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <span className="material-symbols-outlined text-8xl">{stat.icon}</span>
            </div>
          </GlassPanel>
        ))}
      </div>

      {/* Data Table with search bar */}
      <GlassPanel className="p-0 overflow-hidden rounded-2xl border border-outline-variant/10 shadow-2xl">
        <div className="p-6 border-b border-outline-variant/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container/30">
          {/* Left search input */}
          <div className="relative w-full max-w-sm border border-outline-variant/30 rounded-lg bg-black/40 p-0.5 focus-within:border-primary/50 focus-within:shadow-[0_0_10px_rgba(0,219,231,0.1)] transition-all">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Tìm kiếm nội dung tin nhắn lịch sử..."
              className="w-full bg-transparent border-none py-2 pl-10 pr-4 text-on-surface text-sm focus:outline-none focus:ring-0 placeholder:text-on-surface-variant/30"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant text-sm">sort</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value)
                  setPage(1)
                }}
                className="bg-transparent border-none text-on-surface text-xs font-code-label focus:ring-0 cursor-pointer"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="confidence">Độ tin cậy cao</option>
              </select>
            </div>
            <div className="text-on-surface-variant text-xs flex items-center gap-1.5 opacity-60">
              <span className="material-symbols-outlined text-sm">info</span>
              Đã kết nối với cơ sở dữ liệu nút Scam Shield trực tiếp
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-primary font-code-label">
            <span className="material-symbols-outlined animate-spin text-4xl mb-2">sync</span>
            ĐANG TẢI BẢN GHI...
          </div>
        ) : historyItems.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-on-surface-variant font-code-label">
            <span className="material-symbols-outlined text-4xl mb-2">database_off</span>
            KHÔNG CÓ BẢN GHI NÀO PHÙ HỢP BỘ LỌC
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-container-high/20 border-b border-outline-variant/10">
                  {['Nguồn', 'Nội dung tin nhắn', 'Kết quả', 'Độ tin cậy', 'Thời gian', ''].map((h) => (
                    <th key={h} className="px-6 py-4 text-left font-code-label text-on-surface-variant uppercase tracking-wider text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {historyItems.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-container-highest/10 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-on-surface-variant">
                          {getSourceIcon(row.source)}
                        </span>
                        <span className="text-on-surface font-medium">
                          {row.source === 'Manual' ? 'Thủ công' : row.source}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 max-w-xs md:max-w-sm">
                      <p className="text-on-surface truncate group-hover:text-primary transition-colors">
                        "{row.message}"
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <ThreatBadge type={row.prediction}>
                        {row.prediction === 'Scam' ? 'Lừa đảo' : 'An toàn'}
                      </ThreatBadge>
                    </td>
                    <td className="px-6 py-5 w-44">
                      <ConfidenceBar
                        value={row.confidence}
                        isScam={row.prediction === 'Scam'}
                      />
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-on-surface-variant text-sm">
                        {new Date(row.created_at).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => navigate('/detect', { state: { message: row.message } })}
                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                        title="Phân tích lại tin nhắn này"
                      >
                        <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary text-lg">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-6 border-t border-outline-variant/10 flex items-center justify-between">
          <p className="text-sm text-on-surface-variant">
            Hiển thị <span className="text-on-surface font-bold">{totalItems > 0 ? startEntry : 0} - {endEntry}</span> trên tổng số <span className="text-on-surface font-bold">{totalItems}</span> bản ghi
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              className="p-2 hover:bg-surface-variant/20 rounded-lg transition-all disabled:opacity-30 cursor-pointer"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => {
                const prev = arr[idx - 1]
                const showEllipsis = prev && p - prev > 1
                return (
                  <span key={p} className="flex items-center gap-2">
                    {showEllipsis && <span className="text-on-surface-variant px-1">...</span>}
                    <button
                      onClick={() => setPage(p)}
                      className={`px-3 py-1 rounded-sm font-bold transition-all cursor-pointer ${
                        page === p
                          ? 'bg-primary text-on-primary shadow-[0_0_10px_rgba(0,219,231,0.3)]'
                          : 'hover:bg-surface-variant/20 text-on-surface'
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                )
              })}

            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              className="p-2 hover:bg-surface-variant/20 rounded-lg transition-all disabled:opacity-30 cursor-pointer"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </GlassPanel>
    </div>
  )
}
