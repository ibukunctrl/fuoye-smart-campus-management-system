import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Building2, BookOpen, CalendarCheck,
  BarChart3, Users, Settings, LogOut, X, ShieldCheck,
} from 'lucide-react'
import fuoyeLogo from '../../assets/images/fuoye-logo.jpg'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { label: 'Overview',             path: '/admin/dashboard',  icon: LayoutDashboard },
  { label: 'Hostel Management',    path: '/admin/hostels',    icon: Building2 },
  { label: 'Classroom Mgt',        path: '/admin/classrooms', icon: BookOpen },
  { label: 'Booking Requests',     path: '/admin/bookings',   icon: CalendarCheck },
  { label: 'Analytics',            path: '/admin/analytics',  icon: BarChart3 },
  { label: 'Students',             path: '/admin/students',   icon: Users },
  { label: 'Settings',             path: '/admin/settings',   icon: Settings },
]

export default function AdminSidebar({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  function handleLogout() {
    logout()
    navigate('/login')
  }

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
        <button onClick={onClose} className="text-white/50 hover:text-white transition-colors lg:hidden">
          <X size={18} />
        </button>
      </div>

      {/* Admin badge */}
      <div className="px-5 pt-4 pb-2 flex items-center gap-2">
        <span
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#fbbf24' }}
        >
          <ShieldCheck size={10} />
          Admin Panel
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onClose}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                'transition-all duration-200',
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
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={
                    isActive
                      ? { backgroundColor: 'rgba(255,255,255,0.25)' }
                      : { backgroundColor: 'rgba(255,255,255,0.08)' }
                  }
                >
                  <Icon size={16} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/10 flex-shrink-0 space-y-2">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: '#fbbf24' }}
          >
            {(user?.fullName ?? user?.name ?? 'AD').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-semibold truncate">{user?.fullName ?? user?.name ?? 'Admin'}</p>
            <p className="text-white/40 text-[10px] truncate">{user?.email ?? 'admin@fuoye.edu.ng'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </aside>
  )
}
