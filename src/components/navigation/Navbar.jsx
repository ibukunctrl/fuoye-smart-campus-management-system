import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Menu, Bell, ChevronDown, User, Settings, LogOut,
  CalendarPlus, XCircle, CheckCircle2, Clock, X,
} from 'lucide-react'
import fuoyeLogo from '../../assets/images/fuoye-logo.jpg'
import { timeAgo } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/hostel':    'Hostel Booking',
  '/classroom': 'Classroom Booking',
  '/bookings':  'My Bookings',
  '/profile':   'My Profile',
  '/settings':  'Settings',
}

const NOTIF_CONFIG = {
  booking_created:   { icon: CalendarPlus,  color: '#0B5D1E', bg: '#e8f5e9' },
  booking_cancelled: { icon: XCircle,       color: '#ef4444', bg: '#fef2f2' },
  booking_approved:  { icon: CheckCircle2,  color: '#0B5D1E', bg: '#e8f5e9' },
  booking_pending:   { icon: Clock,         color: '#d97706', bg: '#fffbeb' },
}
const NOTIF_FALLBACK = { icon: Bell, color: '#6b7280', bg: '#f3f4f6' }

function getInitials(name) {
  if (!name) return 'ST'
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function Navbar({ onMenuClick }) {
  const navigate       = useNavigate()
  const { pathname }   = useLocation()
  const { user, logout } = useAuth()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen,    setNotifOpen]    = useState(false)

  // Notification actions — stubbed until backend notification API is wired up
  const [, forceRender] = useState(0)
  const markAllNotificationsRead = () => { /* TODO: call api.markNotificationsRead() */ }

  const dropdownRef = useRef(null)
  const notifRef    = useRef(null)

  // Close dropdowns on outside click
  useEffect(() => {
    if (!dropdownOpen && !notifOpen) return
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
      if (notifRef.current    && !notifRef.current.contains(e.target))    setNotifOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [dropdownOpen, notifOpen])

  const title         = PAGE_TITLES[pathname] ?? 'FUOYE Smart Space'
  const initials      = getInitials(user?.fullName || user?.name)
  const notifications = []
  const unreadCount   = 0

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  function openNotif() {
    setNotifOpen((v) => !v)
    setDropdownOpen(false)
  }

  function openDropdown() {
    setDropdownOpen((v) => !v)
    setNotifOpen(false)
  }

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 flex-shrink-0 shadow-sm">

      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <img
          src={fuoyeLogo}
          alt="FUOYE"
          className="w-8 h-8 object-contain rounded flex-shrink-0 lg:hidden"
        />
        <div>
          <h1 className="text-gray-800 font-semibold text-base leading-none">{title}</h1>
          <p className="text-gray-400 text-xs mt-0.5 hidden sm:block">
            Federal University Oye-Ekiti
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">

        {/* ── Notification Bell ── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={openNotif}
            className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 ? (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : (
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
                style={{ backgroundColor: '#6DBE45' }}
              />
            )}
          </button>

          {/* Notification panel */}
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-xs font-semibold text-gray-700">Notifications</p>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => { markAllNotificationsRead(); forceRender((n) => n + 1) }}
                      className="text-[10px] font-medium hover:underline"
                      style={{ color: '#0B5D1E' }}
                    >
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={13} />
                  </button>
                </div>
              </div>

              {notifications.length > 0 ? (
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                  {notifications.map((n) => {
                    const cfg = NOTIF_CONFIG[n.type] ?? NOTIF_FALLBACK
                    const Icon = cfg.icon
                    return (
                      <div
                        key={n.id}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        style={!n.read ? { backgroundColor: '#f0fdf4' } : {}}
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                          style={{ backgroundColor: cfg.bg }}
                        >
                          <Icon size={13} style={{ color: cfg.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-700 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                        </div>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                  <Bell size={20} className="text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400">No notifications yet.</p>
                  <p className="text-[10px] text-gray-300 mt-0.5">
                    Booking updates will appear here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-1.5 hidden sm:block" />

        {/* ── Avatar + Dropdown ── */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={openDropdown}
            className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: '#0B5D1E' }}
            >
              {initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-gray-800 text-xs font-semibold leading-none">
                {user?.fullName ?? user?.name ?? 'Student'}
              </p>
              <p className="text-gray-400 text-[10px] mt-0.5 tracking-wide">
                {user?.matricNumber ?? '---'}
              </p>
            </div>
            <ChevronDown
              size={14}
              className={`text-gray-400 hidden sm:block transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-800 truncate">
                  {user?.fullName ?? user?.name ?? 'Student User'}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5 tracking-wide truncate">
                  {user?.matricNumber ?? '---'}
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                  {user?.department ?? 'Computer Science'}
                </p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => { setDropdownOpen(false); navigate('/profile') }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <User size={15} className="text-gray-400" />
                  Profile
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); navigate('/settings') }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Settings size={15} className="text-gray-400" />
                  Settings
                </button>
              </div>

              <div className="border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
