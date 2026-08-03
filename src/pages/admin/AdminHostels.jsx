import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2, Search, ShieldCheck, Users, BarChart3,
  CheckCircle2, AlertCircle, XCircle, Eye, Trash2, Loader2, Plus, Camera
} from 'lucide-react'
import { api } from '../../services/api'

const STATUS_CFG = {
  available: { label: 'Available', dot: 'bg-green-500', badge: 'bg-green-50 text-green-700' },
  limited:   { label: 'Limited',   dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700' },
  full:      { label: 'Full',      dot: 'bg-red-500',   badge: 'bg-red-50 text-red-600' },
}

function StatusChip({ status }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.full
  return (
    <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

function OccupancyBar({ rate }) {
  const color = rate >= 90 ? '#ef4444' : rate >= 75 ? '#f59e0b' : '#22c55e'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${rate}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] font-bold w-8 text-right" style={{ color }}>{rate}%</span>
    </div>
  )
}

export default function AdminHostels() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingId, setUploadingId] = useState(null)  // hostel id being image-uploaded
  const fileInputRef = useRef(null)
  const uploadTargetId = useRef(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'SCHOOL_HOSTEL',
    price: 0,
    location: '',
    description: '',
    amenities: '',
  })

  const loadHostels = async () => {
    setLoading(true)
    const data = await api.getHostels()
    if (data) setHostels(data)
    setLoading(false)
  }

  useEffect(() => {
    loadHostels()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        ...formData,
        amenities: typeof formData.amenities === 'string' ? formData.amenities.split(',').map(a => a.trim()).filter(Boolean) : formData.amenities
      }
      if (editingId) {
        await api.updateFacility(editingId, payload)
      } else {
        await api.createFacility(payload)
      }
      await loadHostels()
      setIsModalOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this hostel?")) {
      await api.deleteFacility(id)
      loadHostels()
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    const id   = uploadTargetId.current
    if (!file || !id) return
    e.target.value = ''   // reset so the same file can be re-selected
    setUploadingId(id)
    const result = await api.uploadHostelImage(id, file)
    setUploadingId(null)
    if (result.success) {
      // Optimistically update the imageUrl in local state
      setHostels(prev => prev.map(h => h.id === id ? { ...h, imageUrl: result.imageUrl } : h))
    } else {
      alert(result.message || 'Image upload failed')
    }
  }

  const enhancedHostels = useMemo(() => {
    return hostels.map(h => {
      const totalBeds = h.rooms.reduce((s, r) => s + r.totalBeds, 0) || 0
      const availableBeds = h.rooms.reduce((s, r) => s + r.availableBeds, 0) || 0
      const occupancyRate = totalBeds > 0 ? Math.round(((totalBeds - availableBeds) / totalBeds) * 100) : 0
      let status = 'available'
      if (occupancyRate >= 100) status = 'full'
      else if (occupancyRate >= 80) status = 'limited'

      return {
        ...h,
        category: h.type === 'SCHOOL_HOSTEL' ? 'school' : 'private',
        status,
        occupancyRate,
        totalRooms: h.rooms.length,
        availableRooms: h.rooms.filter(r => r.availableBeds > 0).length,
        gender: h.amenities?.find(a => a.toLowerCase().includes('female')) ? 'Female' : (h.amenities?.find(a => a.toLowerCase().includes('male')) ? 'Male' : 'Mixed'),
      }
    })
  }, [hostels])

  const displayed = useMemo(() => {
    const q = search.toLowerCase()
    return enhancedHostels.filter((h) => {
      const matchTab = tab === 'all' || h.category === tab
      const matchSearch = !q || h.name.toLowerCase().includes(q) || h.slug.toLowerCase().includes(q)
      return matchTab && matchSearch
    })
  }, [tab, search, enhancedHostels])

  const schoolHostelsCount = enhancedHostels.filter(h => h.category === 'school').length
  const privateHostelsCount = enhancedHostels.filter(h => h.category === 'private').length

  const tabs = [
    { label: 'All Hostels', value: 'all',     count: enhancedHostels.length },
    { label: 'School',      value: 'school',  count: schoolHostelsCount },
    { label: 'Private',     value: 'private', count: privateHostelsCount },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 size={32} className="animate-spin text-green-700" />
      </div>
    )
  }

  // Hidden file input shared across all rows
  const HiddenFileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={handleImageUpload}
    />
  )

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {HiddenFileInput}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Hostel Management</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {hostels.length} hostels · {enhancedHostels.reduce((s, h) => s + h.availableRooms, 0)} rooms available
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({
              name: '',
              type: 'SCHOOL_HOSTEL',
              price: 0,
              location: '',
              description: '',
              amenities: '',
            })
            setEditingId(null)
            setIsModalOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#0B5D1E' }}
        >
          <Plus size={15} />
          Add Hostel
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Available',    value: enhancedHostels.filter((h) => h.status === 'available').length, icon: CheckCircle2, color: '#0B5D1E', bg: '#e8f5e9' },
          { label: 'Limited',      value: enhancedHostels.filter((h) => h.status === 'limited').length,   icon: AlertCircle,  color: '#b45309', bg: '#fffbeb' },
          { label: 'Full',         value: enhancedHostels.filter((h) => h.status === 'full').length,      icon: XCircle,      color: '#dc2626', bg: '#fef2f2' },
          { label: 'Total Rooms',  value: enhancedHostels.reduce((s, h) => s + h.totalRooms, 0),          icon: Users,        color: '#1565c0', bg: '#e3f2fd' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
              <Icon size={16} style={{ color }} />
            </div>
            <div>
              <p className="text-lg font-black text-gray-800 leading-none">{value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-gray-100">
          {/* Tabs */}
          <div className="flex items-center gap-1">
            {tabs.map(({ label, value, count }) => (
              <button
                key={value}
                onClick={() => setTab(value)}
                className={[
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  tab === value
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
                ].join(' ')}
                style={tab === value ? { backgroundColor: '#0B5D1E' } : {}}
              >
                {label}
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                  style={tab === value
                    ? { backgroundColor: 'rgba(255,255,255,0.25)', color: '#fff' }
                    : { backgroundColor: '#f3f4f6', color: '#6b7280' }}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 sm:ml-auto sm:w-56">
            <Search size={13} className="text-gray-400 flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hostels…"
              className="flex-1 text-xs text-gray-700 bg-transparent outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Photo', 'Hostel', 'Category', 'Gender', 'Status', 'Occupancy', 'Avail. Rooms', 'Price From', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayed.map((hostel) => (
                <tr key={hostel.id} className="hover:bg-gray-50 transition-colors">
                  {/* Photo thumbnail */}
                  <td className="px-4 py-3.5">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 group/img">
                      {hostel.imageUrl ? (
                        <img src={hostel.imageUrl} alt={hostel.name} className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-white text-[9px] font-black"
                          style={{
                            background: hostel.gender === 'Female'
                              ? 'linear-gradient(135deg,#AD1457,#880E4F)'
                              : hostel.gender === 'Male'
                              ? 'linear-gradient(135deg,#1565C0,#0D47A1)'
                              : 'linear-gradient(135deg,#0B5D1E,#1a7a2e)',
                          }}
                        >
                          {hostel.code ?? hostel.slug.substring(0,2).toUpperCase()}
                        </div>
                      )}
                      {/* Camera overlay */}
                      <button
                        title="Upload image"
                        onClick={() => {
                          uploadTargetId.current = hostel.id
                          fileInputRef.current?.click()
                        }}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        {uploadingId === hostel.id
                          ? <Loader2 size={12} className="text-white animate-spin" />
                          : <Camera size={12} className="text-white" />}
                      </button>
                    </div>
                  </td>
                  {/* Name */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-black flex-shrink-0"
                        style={{
                          background: hostel.gender === 'Female'
                            ? 'linear-gradient(135deg,#AD1457,#880E4F)'
                            : hostel.gender === 'Male'
                            ? 'linear-gradient(135deg,#1565C0,#0D47A1)'
                            : 'linear-gradient(135deg,#0B5D1E,#1a7a2e)',
                        }}
                      >
                        {hostel.slug.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800 whitespace-nowrap">{hostel.name}</p>
                        {hostel.verified && (
                          <p className="flex items-center gap-0.5 text-[10px]" style={{ color: '#0B5D1E' }}>
                            <ShieldCheck size={9} /> Verified
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  {/* Category */}
                  <td className="px-4 py-3.5">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                      style={hostel.category === 'school'
                        ? { backgroundColor: '#e8f5e9', color: '#0B5D1E' }
                        : { backgroundColor: '#ede7f6', color: '#6a1b9a' }}
                    >
                      {hostel.category}
                    </span>
                  </td>
                  {/* Gender */}
                  <td className="px-4 py-3.5">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={hostel.gender === 'Female'
                        ? { backgroundColor: '#fce4ec', color: '#ad1457' }
                        : hostel.gender === 'Male'
                        ? { backgroundColor: '#e3f2fd', color: '#1565c0' }
                        : { backgroundColor: '#e8f5e9', color: '#0B5D1E' }}
                    >
                      {hostel.gender}
                    </span>
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3.5"><StatusChip status={hostel.status} /></td>
                  {/* Occupancy */}
                  <td className="px-4 py-3.5 min-w-[120px]">
                    <OccupancyBar rate={hostel.occupancyRate} />
                  </td>
                  {/* Available rooms */}
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-bold text-gray-800">{hostel.availableRooms}</p>
                    <p className="text-[10px] text-gray-400">of {hostel.totalRooms}</p>
                  </td>
                  {/* Price */}
                  <td className="px-4 py-3.5">
                    <p className="text-xs font-bold text-gray-800">₦{Number(hostel.price || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400">/session</p>
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/hostels/${hostel.slug}`)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <Eye size={11} /> View
                      </button>
                      <button 
                        onClick={() => {
                          setFormData({
                            name: hostel.name,
                            type: hostel.type,
                            price: hostel.price || 0,
                            location: hostel.location,
                            description: hostel.description || '',
                            amenities: Array.isArray(hostel.amenities) ? hostel.amenities.join(', ') : '',
                          })
                          setEditingId(hostel.id)
                          setIsModalOpen(true)
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(hostel.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-colors bg-red-500 hover:bg-red-600"
                      >
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {displayed.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 size={28} className="text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">No hostels match your search</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editingId ? 'Edit Hostel' : 'Add Hostel'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Name</label>
                <input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-[#0B5D1E]"
                  placeholder="e.g. Block A"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-[#0B5D1E]"
                  >
                    <option value="SCHOOL_HOSTEL">School</option>
                    <option value="PRIVATE_HOSTEL">Private</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Price</label>
                  <input 
                    required
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-[#0B5D1E]"
                    placeholder="e.g. 50000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Location</label>
                <input 
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-[#0B5D1E]"
                  placeholder="e.g. Phase 1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Amenities (comma separated)</label>
                <input 
                  value={formData.amenities}
                  onChange={(e) => setFormData({...formData, amenities: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-[#0B5D1E]"
                  placeholder="e.g. Wi-Fi, Female, Generator"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-[#0B5D1E]"
                  placeholder="Additional details..."
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="availableForInspection"
                  checked={formData.availableForInspection ?? true}
                  onChange={(e) => setFormData({...formData, availableForInspection: e.target.checked})}
                  className="w-4 h-4 text-[#0B5D1E] rounded border-gray-300 focus:ring-[#0B5D1E]"
                />
                <label htmlFor="availableForInspection" className="text-xs font-semibold text-gray-700 cursor-pointer">
                  Available for Physical Inspection
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
                  style={{ backgroundColor: '#0B5D1E' }}
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
