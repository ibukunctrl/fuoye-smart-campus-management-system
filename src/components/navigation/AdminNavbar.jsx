import { useLocation } from 'react-router-dom'
import { Menu, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const PAGE_TITLES = {
  '/admin/dashboard':  'Overview',
  '/admin/hostels':    'Hostel Management',
  '/admin/classrooms': 'Classroom Management',
  '/admin/bookings':   'Booking Requests',
  '/admin/analytics':  'Analytics',
  '/admin/students':   'Students',
  '/admin/settings':   'Settings',
}

export default function AdminNavbar({ onMenuClick }) {
  const { pathname } = useLocation()
  const { user }     = useAuth()
  const title        = PAGE_TITLES[pathname] ?? 'Admin Panel'

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
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-gray-800 font-semibold text-base leading-none">{title}</h1>
            <span
              className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#fffbeb', color: '#b45309' }}
            >
              <ShieldCheck size={9} />
              Admin
            </span>
          </div>
          <p className="text-gray-400 text-xs mt-0.5 hidden sm:block">
            FUOYE Smart Space - Administration
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-gray-800 text-xs font-semibold leading-none">
            {user?.fullName ?? user?.name ?? 'Admin'}
          </p>
          <p className="text-gray-400 text-[10px] mt-0.5 truncate max-w-[160px]">
            {user?.email ?? 'admin@fuoye.edu.ng'}
          </p>
        </div>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: '#0B5D1E' }}
        >
          {(user?.fullName ?? user?.name ?? 'AD').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
