import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2, BookOpen, CalendarCheck, Users, TrendingUp,
  Clock, CheckCircle2, XCircle, ArrowRight, Layers, Loader2
} from 'lucide-react'
import { api } from '../../services/api'

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
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, bg: '#f3f4f6', color: '#6b7280', icon: Clock }
  const Icon = cfg.icon
  return (
    <span
      className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <Icon size={9} />
      {cfg.label}
    </span>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  
  const [bookings, setBookings] = useState([])
  const [hostels, setHostels] = useState([])
  const [classrooms, setClassrooms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [allBookings, allHostels, allClassrooms] = await Promise.all([
        api.getAllBookings(),
        api.getHostels(),
        api.getClassrooms()
      ]);
      if (allBookings) setBookings(allBookings);
      if (allHostels) setHostels(allHostels);
      if (allClassrooms) setClassrooms(allClassrooms);
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
  
  // Calculate breakdown safely
  const hostelBookings   = bookings.filter((b) => b.facility?.type.includes('HOSTEL')).length
  const classBookings    = bookings.filter((b) => b.facility?.type === 'CLASSROOM').length
  
  const totalHostels     = hostels.length
  const availableBeds    = hostels.reduce((sum, h) => sum + h.rooms.reduce((s, r) => s + r.availableBeds, 0), 0)
  
  const recentBookings   = bookings.slice(0, 6)

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">Admin Overview</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          FUOYE Smart Campus Management System - Administration Dashboard
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={CalendarCheck}
          label="Total Bookings"
          value={totalBookings}
          sub={`${pendingBookings} pending approval`}
          color="#0B5D1E"
          bg="#e8f5e9"
          onClick={() => navigate("/admin/bookings")}
        />
        <StatCard
          icon={Clock}
          label="Pending Requests"
          value={pendingBookings}
          sub="Awaiting admin action"
          color="#b45309"
          bg="#fffbeb"
          onClick={() => navigate("/admin/bookings")}
        />
        <StatCard
          icon={CheckCircle2}
          label="Approved"
          value={confirmedBookings}
          sub="Confirmed bookings"
          color="#0B5D1E"
          bg="#e8f5e9"
        />
        <StatCard
          icon={Building2}
          label="Active Hostels"
          value={totalHostels}
          sub={`${schoolHostels.length} school · ${privateHostels.length} private`}
          color="#6a1b9a"
          bg="#ede7f6"
          onClick={() => navigate("/admin/hostels")}
        />
        <StatCard
          icon={Layers}
          label="Available Beds"
          value={schoolHostelStats.availableRooms}
          sub="School hostel beds"
          color="#1565c0"
          bg="#e3f2fd"
          onClick={() => navigate("/admin/hostels")}
        />
        <StatCard
          icon={BookOpen}
          label="Classrooms"
          value={classrooms.length}
          sub={`${classrooms.filter((c) => c.status === "available").length} available now`}
          color="#0B5D1E"
          bg="#e8f5e9"
          onClick={() => navigate("/admin/classrooms")}
        />
      </div>

      {/* Booking type breakdown + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Breakdown card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">
            Booking Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#e8f5e9" }}
                >
                  <Building2 size={14} style={{ color: "#0B5D1E" }} />
                </div>
                <span className="text-sm text-gray-600">Hostel</span>
              </div>
              <span className="text-sm font-bold text-gray-800">
                {hostelBookings}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#e3f2fd" }}
                >
                  <BookOpen size={14} style={{ color: "#1565c0" }} />
                </div>
                <span className="text-sm text-gray-600">Classroom</span>
              </div>
              <span className="text-sm font-bold text-gray-800">
                {classBookings}
              </span>
            </div>
            {totalBookings > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-50">
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.round((hostelBookings / totalBookings) * 100)}%`,
                      backgroundColor: "#0B5D1E",
                    }}
                  />
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${Math.round((classBookings / totalBookings) * 100)}%`,
                      backgroundColor: "#1565c0",
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-1.5">
                  <span>
                    Hostel{" "}
                    {totalBookings
                      ? Math.round((hostelBookings / totalBookings) * 100)
                      : 0}
                    %
                  </span>
                  <span>
                    Classroom{" "}
                    {totalBookings
                      ? Math.round((classBookings / totalBookings) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Review Pending Requests",
                icon: Clock,
                path: "/admin/bookings",
                color: "#b45309",
                bg: "#fffbeb",
              },
              {
                label: "Manage Hostels",
                icon: Building2,
                path: "/admin/hostels",
                color: "#0B5D1E",
                bg: "#e8f5e9",
              },
              {
                label: "View Classrooms",
                icon: BookOpen,
                path: "/admin/classrooms",
                color: "#1565c0",
                bg: "#e3f2fd",
              },
              {
                label: "View Students",
                icon: Users,
                path: "/admin/students",
                color: "#6a1b9a",
                bg: "#ede7f6",
              },
            ].map(({ label, icon: Icon, path, color, bg }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-left group"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: bg }}
                >
                  <Icon size={16} style={{ color }} />
                </div>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900 leading-snug">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent booking requests */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-700">
            Recent Booking Requests
          </h3>
          <button
            onClick={() => navigate("/admin/bookings")}
            className="flex items-center gap-1 text-xs font-semibold hover:underline"
            style={{ color: "#0B5D1E" }}
          >
            View all <ArrowRight size={12} />
          </button>
        </div>

        {recentBookings.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {recentBookings.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                  style={{
                    backgroundColor:
                      b.facility?.type?.includes("HOSTEL") ? "#0B5D1E" : "#1565c0",
                  }}
                >
                  {b.facility?.type?.includes("HOSTEL") ? (
                    <Building2 size={15} />
                  ) : (
                    <BookOpen size={15} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-700 truncate">
                    {b.facility?.name || 'Unknown'} {b.room?.roomNumber ? `(Room ${b.room.roomNumber})` : ''}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {b.purpose} · {b.user?.matricNumber ?? "N/A"} · {new Date(b.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarCheck size={28} className="text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">No bookings yet</p>
            <p className="text-[11px] text-gray-300 mt-0.5">
              Student booking requests will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
