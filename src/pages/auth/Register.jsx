import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Hash, BookOpen, GraduationCap, Mail, Phone, Users, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Input, Button } from '../../components/common'
import fuoyeLogo from '../../assets/images/fuoye-logo.jpg'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [formData, setFormData] = useState({
    fullName: '',
    matricNumber: '',
    department: '',
    level: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    gender: '',
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

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match')
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters')
    }

    setLoading(true)
    try {
      const payload = {
        fullName:     formData.fullName,
        matricNumber: formData.matricNumber,
        email:        formData.email,
        password:     formData.password,
        department:   formData.department || undefined,
        level:        formData.level       || undefined,
      }

      const result = await register(payload)
      setLoading(false)

      if (!result || !result.success) {
        setError(result?.message || 'Registration failed. Please try again.')
        return
      }
      navigate('/dashboard')
    } catch {
      setLoading(false)
      setError('An error occurred during registration. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-2xl">

        {/* Brand header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white shadow-sm mb-4 overflow-hidden"
            style={{ border: '1px solid #e5e7eb' }}
          >
            <img src={fuoyeLogo} alt="FUOYE Logo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Create Student Account</h1>
          <p className="text-sm text-gray-500 mt-1">
            FUOYE Smart Campus Management System
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-7 py-8">

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100 mb-6">
              <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 font-medium leading-snug">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Full Name */}
            <Input
              label="Full Name"
              name="fullName"
              type="text"
              placeholder="e.g. Adebayo Okonkwo"
              leftIcon={User}
              required
              value={formData.fullName}
              onChange={handleChange}
            />

            {/* Matric Number */}
            <Input
              label="Matric Number"
              name="matricNumber"
              type="text"
              placeholder="e.g. CSC/2022/1045"
              leftIcon={Hash}
              required
              value={formData.matricNumber}
              onChange={handleChange}
            />

            {/* Department */}
            <Input
              label="Department"
              name="department"
              type="text"
              placeholder="e.g. Computer Science"
              leftIcon={BookOpen}
              required
              value={formData.department}
              onChange={handleChange}
            />

            {/* Level */}
            <Input
              label="Level"
              name="level"
              type="text"
              placeholder="e.g. 300"
              leftIcon={GraduationCap}
              required
              value={formData.level}
              onChange={handleChange}
            />

            {/* Email */}
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="your@email.com"
              leftIcon={Mail}
              required
              value={formData.email}
              onChange={handleChange}
            />

            {/* Phone */}
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="e.g. 08012345678"
              leftIcon={Phone}
              value={formData.phone}
              onChange={handleChange}
            />

            {/* Gender */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 select-none">
                Gender <span className="text-red-400 ml-0.5">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Users size={15} />
                </span>
                <select
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700
                             py-2.5 pl-10 pr-4 outline-none transition-all duration-200
                             focus:border-[#0B5D1E] focus:ring-2 focus:ring-[#0B5D1E]/20 focus:bg-white
                             appearance-none"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </div>

            {/* Password */}
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Min. 6 characters"
              leftIcon={Lock}
              required
              value={formData.password}
              onChange={handleChange}
            />

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              leftIcon={Lock}
              required
              wrapperClassName="md:col-span-2"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            {/* Submit */}
            <div className="md:col-span-2 mt-1">
              <Button
                type="submit"
                fullWidth
                loading={loading}
                size="lg"
              >
                Create Account
              </Button>
            </div>
          </form>

          {/* Sign-in link */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold hover:underline"
              style={{ color: '#0B5D1E' }}
            >
              Sign In
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