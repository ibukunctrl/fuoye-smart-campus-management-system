import { useState, useEffect } from 'react'
import { BookOpen, Search, Users, CheckCircle2, XCircle, Loader2, Trash2, Edit } from 'lucide-react'
import { api } from '../../services/api'

export default function AdminClassrooms() {
  const [search, setSearch] = useState('')
  const [classrooms, setClassrooms] = useState([])
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'CLASSROOM',
    capacity: 0,
    location: '',
    description: '',
  })

  const loadClassrooms = async () => {
    setLoading(true)
    const data = await api.getClassrooms()
    if (data) setClassrooms(data)
    setLoading(false)
  }

  useEffect(() => {
    loadClassrooms()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    if (editingId) {
      await api.updateFacility(editingId, formData)
    } else {
      await api.createFacility({ ...formData, type: 'CLASSROOM' })
    }
    await loadClassrooms()
    setIsModalOpen(false)
    setSubmitting(false)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this classroom?")) {
      await api.deleteFacility(id)
      loadClassrooms()
    }
  }

  const displayed = classrooms.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.toLowerCase().includes(search.toLowerCase())
  )

  const getStatus = (c) => c.rooms?.some(r => r.isOccupied) ? 'occupied' : 'available'
  const available = classrooms.filter((c) => getStatus(c) === 'available').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 size={32} className="animate-spin text-green-700" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Classroom Management</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {classrooms.length} classrooms · {available} available
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({
              name: '',
              type: 'CLASSROOM',
              capacity: 0,
              location: '',
              description: '',
            })
            setEditingId(null)
            setIsModalOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#0B5D1E' }}
        >
          <BookOpen size={15} />
          Add Classroom
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',        value: classrooms.length,                                          color: '#0B5D1E', bg: '#e8f5e9' },
          { label: 'Available',    value: available,                                                   color: '#0B5D1E', bg: '#e8f5e9' },
          { label: 'Occupied',     value: classrooms.filter((c) => getStatus(c) === 'occupied').length,   color: '#b45309', bg: '#fffbeb' },
          { label: 'Total Seats',  value: classrooms.reduce((s, c) => s + c.capacity, 0),            color: '#1565c0', bg: '#e3f2fd' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xl font-black text-gray-800">{value}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 flex-1 max-w-xs">
            <Search size={13} className="text-gray-400 flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search classrooms…"
              className="flex-1 text-xs bg-transparent outline-none placeholder:text-gray-400 text-gray-700"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Code', 'Name', 'Faculty / Building', 'Capacity', 'Features', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayed.map((room) => (
                <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-mono font-bold text-gray-700">{room.slug.substring(0, 6).toUpperCase()}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-xs font-semibold text-gray-800">{room.name}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-xs text-gray-600">{room.location}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Users size={12} className="text-gray-400" />
                      <span className="text-xs font-bold text-gray-700">{room.capacity}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {room.amenities?.slice(0, 2).map((f) => (
                        <span key={f} className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{f}</span>
                      ))}
                      {room.amenities?.length > 2 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400">+{room.amenities.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit"
                      style={getStatus(room) === 'available'
                        ? { backgroundColor: '#e8f5e9', color: '#0B5D1E' }
                        : { backgroundColor: '#fef2f2', color: '#dc2626' }}
                    >
                      {getStatus(room) === 'available' ? <CheckCircle2 size={9} /> : <XCircle size={9} />}
                      {getStatus(room) === 'available' ? 'Available' : 'Occupied'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setFormData({
                            name: room.name,
                            type: room.type,
                            capacity: room.capacity,
                            location: room.location,
                            description: room.description || '',
                          })
                          setEditingId(room.id)
                          setIsModalOpen(true)
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <Edit size={11} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(room.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editingId ? 'Edit Classroom' : 'Add Classroom'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Name</label>
                <input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-[#0B5D1E]"
                  placeholder="e.g. SLT 1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Capacity</label>
                  <input 
                    required
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-[#0B5D1E]"
                    placeholder="e.g. 500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Location</label>
                  <input 
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-[#0B5D1E]"
                    placeholder="e.g. Faculty of Science"
                  />
                </div>
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
