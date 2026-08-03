import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Phone, Mail, Building2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card, Button, Input } from '../../components/common'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'

export default function Profile() {
  const navigate  = useNavigate()
  const { user, setUser } = useAuth()
  const current = user ?? {}

  const [form, setForm] = useState({
    name:       current.fullName ?? '',
    department: current.department ?? '',
    email:      current.email      ?? '',
    phone:      current.phoneNumber ?? '',
  })
  
  useEffect(() => {
    if (user) {
      setForm({
        name:       user.fullName  ?? '',
        department: user.department ?? '',
        email:      user.email      ?? '',
        phone:      user.phoneNumber ?? '',
      })
    }
  }, [user])

  const [errors,  setErrors]  = useState({})
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [apiError, setApiError] = useState('')

  function field(key) {
    return {
      value:    form[key],
      onChange: (e) => {
        setForm((f) => ({ ...f, [key]: e.target.value }))
        if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }))
        setSaved(false)
        setApiError('')
      },
    }
  }

  function validate() {
    const e = {}
    if (!form.name.trim())       e.name       = 'Full name is required'
    if (!form.department.trim()) e.department = 'Department is required'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email address'
    if (form.phone && !/^[0-9+\s\-()]{7,15}$/.test(form.phone))
      e.phone = 'Enter a valid phone number'
    return e
  }

  async function handleSave(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    setApiError('')
    const res = await api.updateProfile({
      fullName:    form.name,
      department:  form.department,
      phoneNumber: form.phone,
    })
    setSaving(false)

    if (res?.success) {
      setUser(res.user) // Refresh AuthContext so Sidebar updates immediately
      setSaved(true)
    } else {
      setApiError(res?.message || 'Failed to save profile.')
    }
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">My Profile</h1>
        <p className="text-xs text-gray-400 mt-0.5">Update your personal information</p>
      </div>

      {/* Avatar + matric banner */}
      <Card>
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-black flex-shrink-0"
            style={{ backgroundColor: '#0B5D1E' }}
          >
            {(form.name || 'ST').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">{form.name || 'Student User'}</p>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{current.matricNumber ?? '—'}</p>
            <p className="text-[10px] text-gray-400">{form.department || 'Department not set'}</p>
          </div>
        </div>
      </Card>

      {/* Edit form */}
      <Card title="Personal Information" subtitle="Changes are saved to your local session">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="e.g. Adeola Okonkwo"
              leftIcon={User}
              required
              error={errors.name}
              {...field('name')}
            />
            <Input
              label="Department"
              placeholder="e.g. Computer Science"
              leftIcon={Building2}
              required
              error={errors.department}
              {...field('department')}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="you@fuoye.edu.ng"
              leftIcon={Mail}
              error={errors.email}
              hint="Used for booking notifications"
              {...field('email')}
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+234 800 000 0000"
              leftIcon={Phone}
              error={errors.phone}
              {...field('phone')}
            />
          </div>

          {/* Read-only matric */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 select-none">
              Matric Number
            </label>
            <div className="h-[42px] px-4 rounded-xl border border-gray-200 bg-gray-100 text-sm text-gray-400 font-mono flex items-center">
              {current.matricNumber ?? '—'}
            </div>
            <p className="text-[11px] text-gray-400">Matric number cannot be changed.</p>
          </div>

          {/* Success message */}
          {saved && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-100">
              <CheckCircle2 size={15} style={{ color: '#0B5D1E' }} />
              <p className="text-xs text-green-700 font-medium">Profile updated successfully.</p>
            </div>
          )}

          {/* API error */}
          {apiError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
              <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600 font-medium">{apiError}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
