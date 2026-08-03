import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { Input, Button } from '../../../components/common'
import fuoyeLogo from '../../../assets/images/fuoye-logo.jpg'

export default function AgentLogin() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Using login method since agent uses email as matricNumber fallback during registration
    const result = await login(formData.email, formData.password)

    setLoading(false)

    if (!result || !result.success) {
      setError(result?.message || 'Invalid email or password.')
      return
    }

    // Role redirection is handled by ProtectedRoute, but we can also push them
    navigate('/agent/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-5 py-10">
      <div className="w-full max-w-md">

        {/* Brand header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white shadow-sm mb-4 overflow-hidden"
            style={{ border: '1px solid #e5e7eb' }}
          >
            <img src={fuoyeLogo} alt="FUOYE Logo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to manage your hostel listings</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-8 py-8">

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100 mb-6">
              <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 font-medium leading-snug">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="agent@example.com"
              leftIcon={Mail}
              required
              value={formData.email}
              onChange={handleChange}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              leftIcon={Lock}
              required
              value={formData.password}
              onChange={handleChange}
            />

            <div className="pt-1">
              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loading}
              >
                Sign In
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an agent account?{' '}
            <Link
              to="/agent/register"
              className="font-semibold hover:underline"
              style={{ color: '#0B5D1E' }}
            >
              Register here
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-gray-400 mt-5">
          FUOYE Smart Campus Management System © 2026 · Federal University Oye-Ekiti
        </p>
      </div>
    </div>
  )
}
