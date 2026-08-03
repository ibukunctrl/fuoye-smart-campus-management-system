import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Input, Button } from '../../components/common'
import fuoyeLogo from '../../assets/images/fuoye-logo.jpg'

export default function ForgotPassword() {
  const [value, setValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    // Simulate async delay
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-5 py-10">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white shadow-sm mb-4 overflow-hidden"
            style={{ border: '1px solid #e5e7eb' }}
          >
            <img src={fuoyeLogo} alt="FUOYE Logo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Reset Password</h1>
          <p className="text-sm text-gray-500 mt-1">FUOYE Smart Campus Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-8 py-8">
          {submitted ? (
            /* Success state */
            <div className="flex flex-col items-center text-center py-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: '#e8f5e9' }}
              >
                <CheckCircle2 size={28} style={{ color: '#0B5D1E' }} />
              </div>
              <h2 className="text-lg font-bold text-gray-800 mb-2">Check Your Email</h2>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                If an account with that matric number or email exists, a password reset link has been sent.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
                style={{ color: '#0B5D1E' }}
              >
                <ArrowLeft size={14} />
                Back to Sign In
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-1">Forgot your password?</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Enter your matric number or email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Matric Number or Email"
                  type="text"
                  placeholder="CSC/2022/1045 or your@email.com"
                  leftIcon={Mail}
                  required
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={loading}
                >
                  Send Reset Link
                </Button>
              </form>

              <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
                  style={{ color: '#0B5D1E' }}
                >
                  <ArrowLeft size={14} />
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-gray-400 mt-5">
          FUOYE Smart Campus Management System © 2026 · Federal University Oye-Ekiti
        </p>
      </div>
    </div>
  )
}