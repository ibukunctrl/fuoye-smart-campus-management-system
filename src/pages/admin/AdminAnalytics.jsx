import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Building2, BookOpen, CalendarCheck, Info, Loader2 } from 'lucide-react'
import { api } from '../../services/api'

function MiniBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="font-bold text-gray-800">{value}</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({ bookings: [], hostels: [], classrooms: [] })

  useEffect(() => {
    async function loadData() {
      const [bookings, hostels, classrooms] = await Promise.all([
        api.getAllBookings(),
        api.getHostels(),
        api.getClassrooms()
      ])
      setData({
        bookings: bookings || [],
        hostels: hostels || [],
        classrooms: classrooms || []
      })
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 size={32} className="animate-spin text-green-700" />
      </div>
    )
  }

  const { bookings, hostels, classrooms } = data

  const hostelBks   = bookings.filter((b) => b.facility?.type?.includes('HOSTEL'))
  const classBks    = bookings.filter((b) => !b.facility?.type?.includes('HOSTEL'))
  const pending     = bookings.filter((b) => b.status === 'PENDING').length
  const confirmed   = bookings.filter((b) => b.status === 'CONFIRMED').length
  const rejected    = bookings.filter((b) => b.status === 'REJECTED').length
  const cancelled   = bookings.filter((b) => b.status === 'CANCELLED').length

  const totalHostelRooms = hostels.reduce((sum, h) => sum + h.rooms.length, 0)
  const availableHostelRooms = hostels.reduce((sum, h) => sum + h.rooms.filter(r => r.availableBeds > 0).length, 0)
  const occupiedRooms = totalHostelRooms - availableHostelRooms

  const classAvailable = classrooms.filter((c) => !c.rooms?.some(r => r.isOccupied)).length

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      <div>
        <h1 className="text-xl font-bold text-gray-800">Analytics</h1>
        <p className="text-xs text-gray-400 mt-0.5">Space usage and booking statistics overview</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings',    value: bookings.length, icon: CalendarCheck, color: '#0B5D1E', bg: '#e8f5e9' },
          { label: 'Hostel Bookings',   value: hostelBks.length, icon: Building2,   color: '#6a1b9a', bg: '#ede7f6' },
          { label: 'Classroom Bookings', value: classBks.length, icon: BookOpen,    color: '#1565c0', bg: '#e3f2fd' },
          { label: 'Approval Rate',
            value: bookings.length > 0 ? `${Math.round((confirmed / bookings.length) * 100)}%` : '0%',
            icon: TrendingUp, color: '#0B5D1E', bg: '#e8f5e9' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-xl font-black text-gray-800">{value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Booking status breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-5">Booking Status Breakdown</h3>
          <div className="space-y-4">
            <MiniBar label="Pending"   value={pending}   max={bookings.length} color="#f59e0b" />
            <MiniBar label="Confirmed" value={confirmed} max={bookings.length} color="#22c55e" />
            <MiniBar label="Rejected"  value={rejected}  max={bookings.length} color="#ef4444" />
            <MiniBar label="Cancelled" value={cancelled} max={bookings.length} color="#9ca3af" />
          </div>
        </div>

        {/* Hostel occupancy */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-5">Hostel Occupancy</h3>
          <div className="space-y-4">
            <MiniBar label="Occupied Rooms"   value={occupiedRooms}                    max={totalHostelRooms} color="#0B5D1E" />
            <MiniBar label="Available Rooms"  value={availableHostelRooms} max={totalHostelRooms} color="#22c55e" />
            <MiniBar label="Classrooms Open"  value={classAvailable}                   max={classrooms.length} color="#1565c0" />
          </div>
          <div className="mt-5 pt-4 border-t border-gray-50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Hostel fill rate</span>
              <span className="font-black text-gray-800">
                {totalHostelRooms > 0 ? Math.round((occupiedRooms / totalHostelRooms) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart placeholder */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-700">Booking Trends (Monthly)</h3>
          <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Coming soon</span>
        </div>
        <div
          className="h-40 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: '#f9fafb', border: '2px dashed #e5e7eb' }}
        >
          <div className="text-center">
            <BarChart3 size={28} className="text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Chart will render here once backend data is connected</p>
          </div>
        </div>
      </div>
    </div>
  )
}
