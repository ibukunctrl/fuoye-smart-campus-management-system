import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'
import { Loader2 } from 'lucide-react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      if (localStorage.getItem('fuoye_token')) {
        const profile = await api.getProfile()
        setUser(profile)
      }
      setLoading(false)
    }
    init()
  }, [])

  const login = async (matric, pass) => {
    const res = await api.login(matric, pass)
    if (res?.success) setUser(res.user)
    return res
  }

  const register = async (userData) => {
    const res = await api.register(userData)
    if (res?.success) setUser(res.user)
    return res
  }

  const logout = () => {
    api.logout()
    setUser(null)
  }

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <Loader2 size={32} className="animate-spin text-[#0B5D1E]" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
