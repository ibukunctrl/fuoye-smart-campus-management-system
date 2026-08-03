import { useState } from 'react'
import { X, Loader2, Plus, Trash2 } from 'lucide-react'
import { api } from '../../services/api'

export default function UploadHostelModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    type: 'PRIVATE_HOSTEL',
    location: '',
    description: '',
    price: '',
    imageUrl: '',
    amenities: '',
    availableForInspection: true,
  })

  // We can add initial rooms right when uploading the hostel for simplicity
  const [rooms, setRooms] = useState([
    { roomNumber: '101', totalBeds: 1, pricePerBed: '' }
  ])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleRoomChange = (index, field, value) => {
    const newRooms = [...rooms]
    newRooms[index][field] = value
    setRooms(newRooms)
  }

  const addRoom = () => {
    setRooms([...rooms, { roomNumber: '', totalBeds: 1, pricePerBed: '' }])
  }

  const removeRoom = (index) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        capacity: rooms.reduce((sum, r) => sum + parseInt(r.totalBeds || 1), 0),
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(Boolean),
        // For a full implementation, we'd upload rooms to a separate endpoint or modify the backend to accept rooms in the create payload.
        // Given current backend createFacility signature, we just create the facility. The backend doesn't handle rooms array on create.
      }

      const facility = await api.createFacility(payload)
      
      if (!facility) {
        throw new Error('Failed to upload hostel')
      }

      onSuccess()
    } catch (err) {
      setError(err.message || 'An error occurred while uploading')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Upload New Hostel</h2>
            <p className="text-sm text-gray-500">Add a new property to your listings</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hostel Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0B5D1E] focus:ring-2 focus:ring-[#0B5D1E]/20 outline-none"
                  placeholder="e.g. Sunrise View Villa"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0B5D1E] focus:ring-2 focus:ring-[#0B5D1E]/20 outline-none"
                  placeholder="e.g. Oye-Ekiti, near Phase 1"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0B5D1E] focus:ring-2 focus:ring-[#0B5D1E]/20 outline-none resize-none"
                  placeholder="Describe your hostel's best features..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Base Price (₦ / Year)</label>
                <input
                  type="number"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0B5D1E] focus:ring-2 focus:ring-[#0B5D1E]/20 outline-none"
                  placeholder="150000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amenities (comma separated)</label>
                <input
                  type="text"
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0B5D1E] focus:ring-2 focus:ring-[#0B5D1E]/20 outline-none"
                  placeholder="WiFi, Water, Security..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0B5D1E] focus:ring-2 focus:ring-[#0B5D1E]/20 outline-none"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    name="availableForInspection"
                    checked={formData.availableForInspection}
                    onChange={handleChange}
                    className="w-5 h-5 text-[#0B5D1E] rounded border-gray-300 focus:ring-[#0B5D1E]"
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">Available for Physical Inspection</span>
                    <span className="text-sm text-gray-500">Allow students to book a tour before renting</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-[#0B5D1E] hover:bg-[#0e6e25] text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? 'Uploading...' : 'Upload Hostel'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
