import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2, BookOpen, CalendarCheck, Users, TrendingUp,
  Clock, CheckCircle2, XCircle, ArrowRight, Layers, Loader2
} from 'lucide-react'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const STATUS_CONFIG = {
  PENDING:   { label: 'Pending',   bg: '#fffbeb', color: '#b45309', icon: Clock },
  CONFIRMED: { label: 'Confirmed', bg: '#e8f5e9', color: '#0B5D1E', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', bg: '#fef2f2', color: '#dc2626', icon: XCircle },
  REJECTED:  { label: 'Rejected',  bg: '#fef2f2', color: '#dc2626', icon: XCircle },
}

function StatCard({ icon: Icon, label, value, sub, color, bg, onClick }) {
  return (
    <div
      onClick={onClick}
      className={[
        'bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4',
        onClick ? 'cursor-pointer hover:shadow-md transition-all duration-200 hover:border-gray-200' : '',
      ].join(' ')}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: bg }}
      >
        <Icon size={22} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-black text-gray-800 leading-none">{value}</p>
        <p className="text-xs font-semibold text-gray-600 mt-1">{label}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, bg: '#f3f4f6', color: '#6b7280', icon: Clock }
  const Icon = cfg.icon
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <Icon size={9} />
      {cfg.label}
    </span>
  )
}

export default function AgentDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [bookings, setBookings] = useState([])
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [agentBookings, agentHostels] = await Promise.all([
        api.getAgentBookings(),
        api.getAgentFacilities()
      ]);
      if (agentBookings) setBookings(agentBookings);
      if (agentHostels) setHostels(agentHostels);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 size={32} className="animate-spin text-green-700" />
      </div>
    )
  }

  const totalBookings    = bookings.length
  const pendingBookings  = bookings.filter((b) => b.status === 'PENDING').length
  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED').length
  
  const totalHostels     = hostels.length
  const availableBeds    = hostels.reduce((sum, h) => sum + (h.rooms || []).reduce((s, r) => s + (r.availableBeds || 0), 0), 0)
  const totalBeds        = hostels.reduce((sum, h) => sum + (h.rooms || []).reduce((s, r) => s + (r.totalBeds || 0), 0), 0)
  
  const recentBookings   = bookings.slice(0, 5)

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-gradient-to-r from-[#0B5D1E] to-[#147a2c] p-6 sm:p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, {user?.fullName.split(' ')[0]} 👋</h1>
          <p className="text-sm sm:text-base text-green-50 mt-1.5 opacity-90">
            Here's what's happening with your properties today.
          </p>
        </div>
        <div className="relative z-10 flex gap-3">
          <button
            onClick={() => navigate('/agent/hostels')}
            className="bg-white text-[#0B5D1E] px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-50 transition-colors shadow-sm"
          >
            Manage Hostels
          </button>
        </div>
        
        {/* Decorative circle */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Building2}
          label="My Properties"
          value={totalHostels}
          sub="Listed hostels"
          color="#6a1b9a"
          bg="#ede7f6"
          onClick={() => navigate("/agent/hostels")}
        />
        <StatCard
          icon={Layers}
          label="Available Beds"
          value={availableBeds}
          sub={`Out of ${totalBeds} total capacity`}
          color="#1565c0"
          bg="#e3f2fd"
          onClick={() => navigate("/agent/hostels")}
        />
        <StatCard
          icon={CalendarCheck}
          label="Total Bookings"
          value={totalBookings}
          sub="All time reservations"
          color="#0B5D1E"
          bg="#e8f5e9"
        />
        <StatCard
          icon={Clock}
          label="Pending Action"
          value={pendingBookings}
          sub="Awaiting your approval"
          color="#b45309"
          bg="#fffbeb"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Bookings Table (Takes up 2 columns on large screens) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
            <h2 className="text-base font-bold text-gray-800">Recent Bookings & Inspections</h2>
            <button className="text-[11px] font-bold text-[#0B5D1E] hover:text-[#147a2c] flex items-center gap-1">
              View All <ArrowRight size={12} />
            </button>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            {recentBookings.length > 0 ? (
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Property</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 align-middle">
                        <div className="font-semibold text-sm text-gray-800">{b.facility?.name}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{b.room?.roomNumber ? `Room ${b.room.roomNumber}` : 'General Booking'}</div>
                      </td>
                      <td className="px-5 py-3 align-middle">
                        <div className="text-sm font-medium text-gray-700">{b.user?.fullName}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{b.user?.phoneNumber || b.user?.email}</div>
                      </td>
                      <td className="px-5 py-3 align-middle">
                        <span className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                          {b.requiresInspection ? 'Inspection' : 'Direct Booking'}
                        </span>
                      </td>
                      <td className="px-5 py-3 align-middle">
                        <div className="text-[12px] text-gray-600">
                          {new Date(b.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-5 py-3 align-middle text-right">
                        <StatusBadge status={b.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                  <CalendarCheck size={20} className="text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-600">No bookings yet</p>
                <p className="text-[11px] text-gray-400 mt-1">When students book your properties, they'll appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Overview & Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => navigate('/agent/hostels')}
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-[#0B5D1E] hover:bg-green-50/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-[#0B5D1E]">
                    <Building2 size={16} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-700 group-hover:text-[#0B5D1E] transition-colors">Add New Hostel</p>
                    <p className="text-[10px] text-gray-400">List another property</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-gray-300 group-hover:text-[#0B5D1E] transition-colors" />
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
             <h3 className="text-sm font-bold text-gray-700 mb-4">Performance Overview</h3>
             <div className="space-y-4">
               <div>
                 <div className="flex justify-between text-xs mb-1">
                   <span className="font-medium text-gray-600">Occupancy Rate</span>
                   <span className="font-bold text-[#0B5D1E]">
                     {totalBeds > 0 ? Math.round(((totalBeds - availableBeds) / totalBeds) * 100) : 0}%
                   </span>
                 </div>
                 <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-[#0B5D1E] rounded-full" 
                     style={{ width: `${totalBeds > 0 ? ((totalBeds - availableBeds) / totalBeds) * 100 : 0}%` }}
                   />
                 </div>
               </div>
               
               <div>
                 <div className="flex justify-between text-xs mb-1">
                   <span className="font-medium text-gray-600">Booking Conversion</span>
                   <span className="font-bold text-blue-600">
                     {totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 0}%
                   </span>
                 </div>
                 <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-blue-500 rounded-full" 
                     style={{ width: `${totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0}%` }}
                   />
                 </div>
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}
