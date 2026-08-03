import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react'
import { Card, Button, Input } from '../../components/common'
import { cn } from '../../utils/cn'
import { api } from '../../services/api'

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-10 h-6 rounded-full transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#0B5D1E]/30',
      )}
      style={{ backgroundColor: checked ? '#0B5D1E' : '#d1d5db' }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200"
        style={{ left: checked ? '18px' : '2px' }}
      />
    </button>
  )
}

function SettingRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-gray-100 last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

const EMPTY_PW = { current: '', next: '', confirm: '' }

export default function Settings() {
  const navigate = useNavigate()
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    bookingReminders: true,
    systemAlerts: true,
  })
  const [prefSaved, setPrefSaved] = useState(false)

  const [pw, setPw]             = useState(EMPTY_PW)
  const [pwErrors, setPwErrors] = useState({})
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSaved,  setPwSaved]  = useState(false)
  const [pwApiError, setPwApiError] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew,     setShowNew]     = useState(false)

  function togglePref(key, val) {
    const updated = { ...prefs, [key]: val }
    setPrefs(updated)
    setPrefSaved(true)
    setTimeout(() => setPrefSaved(false), 2000)
  }

  function validatePw() {
    const e = {}
    if (!pw.current)         e.current = 'Current password is required'
    if (pw.next.length < 6)  e.next    = 'New password must be at least 6 characters'
    if (pw.next !== pw.confirm) e.confirm = 'Passwords do not match'
    return e
  }

  async function handlePwSave(e) {
    e.preventDefault()
    const errs = validatePw()
    if (Object.keys(errs).length) { setPwErrors(errs); return }
    setPwSaving(true)
    setPwApiError('')
    const res = await api.changePassword(pw.current, pw.next)
    setPwSaving(false)
    if (res?.success) {
      setPwSaved(true)
      setPw(EMPTY_PW)
      setPwErrors({})
    } else {
      setPwApiError(res?.message || 'Failed to change password.')
    }
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">Settings</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Manage your account and notification preferences
        </p>
      </div>

      {/* Notification preferences */}
      <Card
        title="Notifications"
        subtitle="Control how you receive updates"
        actions={
          prefSaved && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600">
              <CheckCircle2 size={11} />
              Saved
            </span>
          )
        }
      >
        <div className="-mt-1">
          <SettingRow
            label="Email Notifications"
            description="Receive booking confirmations and updates by email"
            checked={prefs.emailNotifications}
            onChange={(v) => togglePref("emailNotifications", v)}
          />
          <SettingRow
            label="Booking Reminders"
            description="Get reminded 24 hours before your scheduled booking"
            checked={prefs.bookingReminders}
            onChange={(v) => togglePref("bookingReminders", v)}
          />
          <SettingRow
            label="System Alerts"
            description="Notifications about room status changes and maintenance"
            checked={prefs.systemAlerts}
            onChange={(v) => togglePref("systemAlerts", v)}
          />
        </div>
      </Card>

      {/* Account */}
      <Card title="Account" subtitle="Manage your profile information">
        <button
          onClick={() => navigate("/profile")}
          className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#e8f5e9" }}
            >
              <User size={16} style={{ color: "#0B5D1E" }} />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-700">
                Edit Profile
              </p>
              <p className="text-[10px] text-gray-400">
                Name, department, email, phone
              </p>
            </div>
          </div>
          <ChevronRight
            size={15}
            className="text-gray-300 group-hover:text-gray-500 transition-colors"
          />
        </button>
      </Card>

      {/* Security */}
      <Card title="Security" subtitle="Update your account password">
        <form onSubmit={handlePwSave} className="space-y-4">
          <div className="relative">
            <Input
              label="Current Password"
              type={showCurrent ? "text" : "password"}
              placeholder="Enter current password"
              leftIcon={Lock}
              value={pw.current}
              onChange={(e) => {
                setPw((p) => ({ ...p, current: e.target.value }));
                setPwErrors((er) => ({ ...er, current: undefined }));
              }}
              error={pwErrors.current}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type={showNew ? "text" : "password"}
              placeholder="Min. 6 characters"
              value={pw.next}
              onChange={(e) => {
                setPw((p) => ({ ...p, next: e.target.value }));
                setPwErrors((er) => ({ ...er, next: undefined }));
              }}
              error={pwErrors.next}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter new password"
              value={pw.confirm}
              onChange={(e) => {
                setPw((p) => ({ ...p, confirm: e.target.value }));
                setPwErrors((er) => ({ ...er, confirm: undefined }));
              }}
              error={pwErrors.confirm}
            />
          </div>

          {pwSaved && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-100">
              <CheckCircle2 size={15} style={{ color: "#0B5D1E" }} />
              <p className="text-xs text-green-700 font-medium">
                Password changed successfully.
              </p>
            </div>
          )}

          {pwApiError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
              <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600 font-medium">{pwApiError}</p>
            </div>
          )}

          <Button type="submit" size="sm" loading={pwSaving}>
            Update Password
          </Button>
        </form>
      </Card>

      {/* About */}
      <Card title="About" subtitle="Application information">
        <div className="space-y-3 text-xs text-gray-500">
          <div className="flex justify-between gap-4">
            <span>Application</span>
            <span className="font-semibold text-gray-700 text-right">
              FUOYE Smart Campus Management System
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span>Version</span>
            <span className="font-semibold text-gray-700 text-right">
              1.0.0 (CSC 320 Project)
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span>Institution</span>
            <span className="font-semibold text-gray-700 text-right">
              Federal University Oye-Ekiti
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span>Developed By</span>
            <span className="font-semibold text-gray-700 text-right">
              CSC 320 Project Group B
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span>Department</span>
            <span className="font-semibold text-gray-700 text-right">
              Computer Science Department
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span>Academic Session</span>
            <span className="font-semibold text-gray-700 text-right">
              2025/2026
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span>Tech Stack</span>
            <span className="font-semibold text-gray-700 text-right">
              React • Vite • Tailwind CSS
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
