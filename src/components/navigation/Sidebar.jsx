import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  CalendarCheck,
  User,
  Settings,
  X,
} from 'lucide-react'
import fuoyeLogo from '../../assets/images/fuoye-logo.jpg'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'

const navItems = [
  { label: 'Dashboard',         path: '/dashboard', icon: LayoutDashboard },
  { label: 'Hostel Booking',    path: '/hostel',    icon: Building2 },
  { label: 'Classroom Booking', path: '/classroom', icon: BookOpen },
  { label: 'My Bookings',       path: '/bookings',  icon: CalendarCheck, badge: true },
  { label: 'Profile',           path: '/profile',   icon: User },
  { label: 'Settings',          path: '/settings',  icon: Settings },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    async function load() {
      const b = await api.getMyBookings()
      if (b) setUnread(b.filter(x => x.status === 'PENDING').length)
    }
    load()
  }, [])

  return (
    <aside
      className={[
        'fixed top-0 left-0 z-30 h-full w-64 flex-shrink-0 flex flex-col',
        'transform transition-transform duration-300 ease-in-out',
        'lg:static lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}
      style={{ backgroundColor: '#0B5D1E' }}
    >
      {/* Brand */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-white p-0.5 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src={fuoyeLogo} alt="FUOYE Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">FUOYE</p>
            <p className="text-[10px] leading-none mt-0.5" style={{ color: '#a8d5a2' }}>
              Smart Space System
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/50 hover:text-white transition-colors lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      {/* Section label */}
      <div className="px-5 pt-5 pb-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#6DBE45' }}>
          Main Menu
        </p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, path, icon: Icon, badge }) => {
          return (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                  'transition-all duration-200 group',
                  isActive
                    ? 'text-white shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/10',
                ].join(' ')
              }
              style={({ isActive }) =>
                isActive ? { backgroundColor: '#6DBE45' } : {}
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200"
                    style={
                      isActive
                        ? { backgroundColor: 'rgba(255,255,255,0.25)' }
                        : { backgroundColor: 'rgba(255,255,255,0.08)' }
                    }
                  >
                    <Icon size={16} />
                  </span>
                  <span className="flex-1">{label}</span>
                  {badge && unread > 0 && (
                    <span className="min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: '#6DBE45' }}
          >
            {(user?.fullName ?? 'ST').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.fullName ?? 'Student User'}</p>
            <p className="text-white/40 text-[10px] truncate">
              {user?.email ?? user?.matricNumber ?? 'fuoye.edu.ng'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
