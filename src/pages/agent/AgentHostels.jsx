import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Home, Search, Loader2 } from 'lucide-react'
import { api } from '../../services/api'
import UploadHostelModal from './UploadHostelModal'

export default function AgentHostels() {
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchHostels()
  }, [])

  const fetchHostels = async () => {
    setLoading(true)
    const data = await api.getAgentFacilities()
    if (data) {
      setHostels(data)
    }
    setLoading(false)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Hostels</h1>
          <p className="text-gray-500 mt-1">Manage your uploaded hostels and rooms</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-[#0B5D1E] hover:bg-[#0e6e25] text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          Upload New Hostel
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[#0B5D1E] mb-4" />
            <p className="text-gray-500 font-medium">Loading your properties...</p>
          </div>
        ) : hostels.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-4">
              <Home size={28} className="text-[#0B5D1E]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No hostels uploaded yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Get started by uploading your first hostel property to make it available for students to book.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-6 text-[#0B5D1E] font-semibold hover:underline"
            >
              Click here to upload
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {hostels.map((hostel) => (
              <div key={hostel.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-100 relative">
                  {hostel.imageUrl ? (
                    <img src={hostel.imageUrl} alt={hostel.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <Home size={32} />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold shadow-sm">
                    {hostel.rooms?.length || 0} Rooms
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{hostel.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-1">{hostel.location}</p>
                  
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                    <button className="flex-1 px-4 py-2 bg-green-50 text-[#0B5D1E] hover:bg-green-100 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                      <Edit size={16} />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <UploadHostelModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false)
            fetchHostels()
          }} 
        />
      )}
    </div>
  )
}
