/**
 * SettingsPage — System configuration persisted locally per analyst.
 */

import { useState } from 'react'
import GlassPanel from '../components/GlassPanel'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const DEFAULT_SETTINGS = {
  sensitivity: 85,
  predictiveShield: true,
  deepLogScan: true,
  strictLockdown: false,
}

function loadSavedSettings() {
  try {
    const raw = localStorage.getItem('scam_shield_settings')
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

export default function SettingsPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [settings, setSettings] = useState(loadSavedSettings)

  const handleSave = () => {
    localStorage.setItem('scam_shield_settings', JSON.stringify(settings))
    addToast('Đã lưu cấu hình giao diện & ngưỡng hiển thị cục bộ.', 'success')
  }

  const handleReset = () => {
    setSettings(loadSavedSettings())
    addToast('Đã khôi phục về cấu hình đã lưu gần nhất.', 'info')
  }

  const toggleLockdown = () => {
    setSettings((prev) => {
      const nextVal = !prev.strictLockdown
      addToast(
        nextVal ? 'Đã bật chế độ cảnh báo nghiêm ngặt trên trình duyệt.' : 'Đã tắt chế độ cảnh báo nghiêm ngặt.',
        nextVal ? 'warn' : 'info'
      )
      return { ...prev, strictLockdown: nextVal }
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Theme */}
          <GlassPanel className="space-y-6">
            <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-4">
              <span className="material-symbols-outlined text-primary">palette</span>
              <h3 className="text-xl font-semibold" style={{ fontFamily: 'Geist' }}>Giao diện</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-primary/30">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">dark_mode</span>
                  <div>
                    <p className="font-medium text-sm">Chế độ Tối (Cybersecurity)</p>
                    <p className="text-[11px] text-on-surface-variant">Giao diện mặc định tối ưu cho phân tích</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-primary/15 text-primary font-code-label text-[10px]">ĐANG BẬT</span>
              </div>
            </div>
          </GlassPanel>

          {/* Profile */}
          <GlassPanel className="relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-6xl">verified_user</span>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl border-2 border-primary/40 p-1 flex items-center justify-center bg-surface-container-high">
                <span className="material-symbols-outlined text-primary text-3xl">person</span>
              </div>
              <div className="min-w-0">
                <h4 className="text-lg font-bold truncate" style={{ fontFamily: 'Geist' }}>{user?.name || 'Analyst'}</h4>
                <p className="text-primary font-code-label text-xs">{user?.role || 'Analyst'}</p>
                <p className="text-on-surface-variant text-xs truncate">{user?.email || ''}</p>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant border-t border-outline-variant/15 pt-3">
              Phiên xác thực bằng JWT (HS256), dữ liệu lịch sử được cô lập theo từng tài khoản.
            </p>
          </GlassPanel>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* AI Engine */}
          <GlassPanel className="relative p-8">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                <h3 className="text-2xl font-semibold" style={{ fontFamily: 'Geist' }}>Động cơ Trí tuệ Nhân tạo AI</h3>
              </div>
              <span className="px-3 py-1 bg-primary/10 border border-primary/30 text-primary font-code-label rounded-sm">XLM-ROBERTA BASE</span>
            </div>

            {/* Sensitivity Slider */}
            <div className="space-y-6 mb-10">
              <div className="flex justify-between items-end">
                <div>
                  <label className="font-semibold text-lg">Ngưỡng cảnh báo hiển thị</label>
                  <p className="font-body-sm text-on-surface-variant">Điều chỉnh mức độ ưu tiên cảnh báo trên giao diện trình duyệt</p>
                </div>
                <span className={`font-code-label text-xl ${settings.sensitivity > 80 ? 'text-secondary' : 'text-primary'}`}>
                  {settings.sensitivity}%
                </span>
              </div>
              <div className="relative py-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.sensitivity}
                  onChange={(e) => setSettings((prev) => ({ ...prev, sensitivity: Number(e.target.value) }))}
                  className="w-full h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer"
                  style={{
                    accentColor: settings.sensitivity > 80 ? '#ff525c' : '#00dbe7',
                  }}
                />
                <div className="flex justify-between mt-4 text-[10px] font-code-label text-on-surface-variant uppercase tracking-widest">
                  <span>Thụ động</span>
                  <span>Cân bằng</span>
                  <span className={settings.sensitivity > 80 ? 'text-secondary font-bold' : ''}>Tối đa</span>
                </div>
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/20 hover:border-primary/40 transition-colors cursor-pointer block">
                <div className="flex justify-between items-start mb-2">
                  <span className="material-symbols-outlined text-primary">auto_awesome</span>
                  <input
                    type="checkbox"
                    checked={settings.predictiveShield}
                    onChange={(e) => setSettings((prev) => ({ ...prev, predictiveShield: e.target.checked }))}
                    className="w-5 h-5 rounded-sm border-outline-variant bg-surface-dim text-primary focus:ring-primary/50 cursor-pointer"
                  />
                </div>
                <p className="font-medium text-sm">Đánh dấu từ khóa nghi vấn</p>
                <p className="text-xs text-on-surface-variant">Tô sáng cụm từ lừa đảo khi phân tích tin nhắn</p>
              </label>

              <label className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/20 hover:border-primary/40 transition-colors cursor-pointer block">
                <div className="flex justify-between items-start mb-2">
                  <span className="material-symbols-outlined text-primary">history_edu</span>
                  <input
                    type="checkbox"
                    checked={settings.deepLogScan}
                    onChange={(e) => setSettings((prev) => ({ ...prev, deepLogScan: e.target.checked }))}
                    className="w-5 h-5 rounded-sm border-outline-variant bg-surface-dim text-primary focus:ring-primary/50 cursor-pointer"
                  />
                </div>
                <p className="font-medium text-sm">Lưu nhật ký quét tự động</p>
                <p className="text-xs text-on-surface-variant">Ghi nhận mọi kết quả vào cơ sở dữ liệu cá nhân</p>
              </label>
            </div>
          </GlassPanel>

          {/* Lockdown Card */}
          <GlassPanel className="flex flex-col sm:flex-row items-center justify-between gap-4 border-l-4 border-secondary-container">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-2xl">emergency</span>
              </div>
              <div>
                <h4 className="font-bold text-base">Chế độ Cảnh báo Nghiêm ngặt</h4>
                <p className="text-xs text-on-surface-variant">Nhấn mạnh trực quan khi độ tin cậy lừa đảo vượt ngưỡng đã chọn.</p>
              </div>
            </div>
            <button
              onClick={toggleLockdown}
              className={`px-5 py-2 font-bold text-xs rounded-full transition-all cursor-pointer ${
                settings.strictLockdown
                  ? 'bg-secondary text-on-secondary'
                  : 'border border-secondary text-secondary hover:bg-secondary/10'
              }`}
            >
              {settings.strictLockdown ? 'ĐANG BẬT' : 'KÍCH HOẠT'}
            </button>
          </GlassPanel>
        </div>
      </div>

      {/* Footer Action Bar */}
      <GlassPanel className="flex justify-end gap-4 p-4 border border-primary/20">
        <button
          onClick={handleReset}
          className="px-6 py-2 font-code-label text-xs text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
        >
          Hủy bỏ Thay đổi
        </button>
        <button
          onClick={handleSave}
          className="px-8 py-2 bg-primary text-on-primary font-bold text-xs rounded-lg shadow-[0_0_15px_rgba(0,219,231,0.4)] hover:shadow-[0_0_25px_rgba(0,219,231,0.6)] transition-all cursor-pointer"
        >
          Lưu Cấu hình
        </button>
      </GlassPanel>
    </div>
  )
}
