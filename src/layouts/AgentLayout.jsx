import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { 
  Building2, 
  LogOut, 
  Menu,
  X,
  LayoutDashboard
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import fuoyeLogo from '../assets/images/fuoye-logo.jpg'

export default function AgentLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { name: 'Dashboard', path: '/agent/dashboard', icon: LayoutDashboard },
    { name: 'My Hostels', path: '/agent/hostels', icon: Building2 },
  ]

  const handleLogout = () => {
    logout()
    navigate('/agent/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 h-screen w-64 bg-white border-r border-gray-200 
        flex flex-col transition-transform duration-300 z-50
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-100">
          <img src={fuoyeLogo} alt="FUOYE" className="w-8 h-8 rounded-lg" />
          <span className="font-bold text-gray-900 tracking-tight">Agent Portal</span>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-gray-500 hover:bg-gray-100 p-1 rounded-md"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Info */}
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-700 flex items-center justify-center font-bold text-xl mb-3">
            {user?.fullName?.charAt(0) || 'A'}
          </div>
          <h3 className="font-semibold text-gray-900 truncate">{user?.fullName}</h3>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-[#0B5D1E] text-white' 
                    : 'text-gray-600 hover:bg-green-50 hover:text-[#0B5D1E]'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                {item.name}
              </NavLink>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4 shrink-0 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <span className="ml-2 font-bold text-gray-900">Agent Portal</span>
        </header>

        {/* Page Content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
