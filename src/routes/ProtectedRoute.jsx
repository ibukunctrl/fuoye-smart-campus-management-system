import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ requiredRole }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
        <Loader2 size={32} className="animate-spin text-[#0B5D1E]" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (requiredRole) {
    const userRole = (user.role || '').toLowerCase()
    const reqRole = (requiredRole || '').toLowerCase()

    if (userRole !== reqRole) {
      if (userRole === 'admin') return <Navigate to="/admin/dashboard" replace />
      if (userRole === 'agent') return <Navigate to="/agent/dashboard" replace />
      return <Navigate to="/dashboard" replace />
    }
  }

  return <Outlet />
}
