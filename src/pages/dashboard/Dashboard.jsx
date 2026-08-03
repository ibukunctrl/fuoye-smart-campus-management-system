import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarCheck,
  Building2,
  BookOpen,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Info,
  TrendingUp,
  Sparkles,
  Hand,
} from 'lucide-react'
import { timeAgo, formatDate } from '../../utils/helpers'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const quickActions = [
  {
    label: 'Book a Classroom',
    description: 'Reserve a lecture hall or lab space',
    path: '/classroom',
    icon: BookOpen,
    color: '#0B5D1E',
    bg: 'rgba(11, 93, 30, 0.08)',
  },
  {
    label: 'View Hostel Spaces',
    description: 'Check hostel room & bed availability',
    path: '/hostel',
    icon: Building2,
    color: '#1565C0',
    bg: 'rgba(21, 101, 192, 0.08)',
  },
  {
    label: 'My Bookings',
    description: 'Track, view, or cancel your bookings',
    path: '/bookings',
    icon: CalendarCheck,
    color: '#E65100',
    bg: 'rgba(230, 81, 0, 0.08)',
  },
]

const activityIcons = {
  success: <CheckCircle2 size={16} className="flex-shrink-0 text-emerald-600 mt-0.5" />,
  warning: <AlertCircle size={16} className="flex-shrink-0 text-amber-600 mt-0.5" />,
  info: <Info size={16} className="flex-shrink-0 text-blue-600 mt-0.5" />,
}

const activityBg = {
  success: 'bg-emerald-50/80 border-emerald-100',
  warning: 'bg-amber-50/80 border-amber-100',
  info: 'bg-blue-50/80 border-blue-100',
}

function buildActivityFeed(bookings) {
  if (!bookings || !bookings.length) return []
  return bookings
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5)
    .map((b) => {
      const roomLabel = b.roomCode || b.roomName || b.room?.roomNumber || 'Space'
      const formattedDate = formatDate(b.date || b.startTime)
      const st = (b.status || '').toLowerCase()

      switch (st) {
        case 'confirmed':
          return {
            id: b.id,
            text: `${roomLabel} booking confirmed for ${formattedDate}`,
            type: 'success',
            time: timeAgo(b.createdAt),
          }
        case 'pending':
          return {
            id: b.id,
            text: `${roomLabel} booking request for "${b.purpose || 'Campus Space'}" is pending approval`,
            type: 'warning',
            time: timeAgo(b.createdAt),
          }
        case 'completed':
          return {
            id: b.id,
            text: `${roomLabel} booking completed — ${b.purpose || 'Session complete'}`,
            type: 'success',
            time: timeAgo(b.createdAt),
          }
        case 'cancelled':
        case 'rejected':
          return {
            id: b.id,
            text: `${roomLabel} reservation on ${formattedDate} was ${st}`,
            type: 'info',
            time: timeAgo(b.createdAt),
          }
        default:
          return {
            id: b.id,
            text: `${roomLabel} reservation recorded`,
            type: 'info',
            time: timeAgo(b.createdAt),
          }
      }
    })
}

function computeStats(bookings, classrooms, hostels) {
  const safeBookings = bookings || []
  
  const activeBookings = safeBookings.filter(
    (b) => (b.status || '').toLowerCase() === 'confirmed'
  ).length
  
  const availableClassrooms = (classrooms || []).filter(
    (c) => !c.rooms?.some(r => r.isOccupied)
  ).length
  
  const pendingRequests = safeBookings.filter(
    (b) => (b.status || '').toLowerCase() === 'pending'
  ).length

  const totalHostelRooms = (hostels || []).reduce((sum, h) => sum + h.rooms.length, 0)
  const availableHostelRooms = (hostels || []).reduce((sum, h) => sum + h.rooms.filter(r => r.availableBeds > 0).length, 0)
  const occupiedRooms = totalHostelRooms - availableHostelRooms
  const hostelOccupancy = totalHostelRooms > 0 ? Math.round((occupiedRooms / totalHostelRooms) * 100) : 0

  return [
    {
      label: 'Active Bookings',
      value: String(activeBookings),
      sub: pendingRequests > 0 ? `+${pendingRequests} pending` : 'All confirmed',
      icon: CalendarCheck,
      iconColor: '#0B5D1E',
      iconBg: '#e8f5e9',
      trend: activeBookings > 0,
    },
    {
      label: 'Available Classrooms',
      value: String(availableClassrooms),
      sub: `Out of ${classrooms?.length || 0} total`,
      icon: BookOpen,
      iconColor: '#1565C0',
      iconBg: '#e3f2fd',
      trend: false,
    },
    {
      label: 'Hostel Occupancy',
      value: `${hostelOccupancy}%`,
      sub: `Based on occupied rooms`,
      icon: Building2,
      iconColor: '#E65100',
      iconBg: '#fff3e0',
      trend: false,
    },
    {
      label: 'Pending Requests',
      value: String(pendingRequests),
      sub: pendingRequests === 0 ? 'Nothing awaiting action' : 'Awaiting admin approval',
      icon: Clock,
      iconColor: '#6A1B9A',
      iconBg: '#f3e5f5',
      trend: false,
    },
  ]
}

export default function Dashboard() {
  const { user: authUser } = useAuth()
  const [bookings, setBookings] = useState([])
  const [classrooms, setClassrooms] = useState([])
  const [hostels, setHostels] = useState([])
  const [fetchedUser, setFetchedUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.getMyBookings(),
      api.getClassrooms(),
      api.getHostels(),
      api.getProfile()
    ]).then(([resBookings, resClassrooms, resHostels, resUser]) => {
      if (!mounted) return;
      if (resBookings) setBookings(resBookings);
      if (resClassrooms) setClassrooms(resClassrooms);
      if (resHostels) setHostels(resHostels);
      if (resUser) setFetchedUser(resUser);
      setLoading(false);
    }).catch(() => {
      if (mounted) setLoading(false);
    })
    return () => { mounted = false; };
  }, []);

  const stats = computeStats(bookings, classrooms, hostels)
  const activity = buildActivityFeed(bookings)

  const activeUser = authUser || fetchedUser
  const userName = activeUser?.fullName || activeUser?.name || 'Student'
  const firstName = userName.split(' ')[0]

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      {/* Welcome banner */}
      <div
        className="relative rounded-3xl p-6 md:p-8 text-white overflow-hidden shadow-xl"
        style={{ background: 'linear-gradient(150deg, #0B5D1E 0%, #0e6e25 55%, #084415 100%)' }}
      >
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-10 bg-white blur-xl" />
        <div className="absolute right-12 -bottom-10 w-36 h-36 rounded-full opacity-15 blur-lg" style={{ backgroundColor: '#6DBE45' }} />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-emerald-200 mb-3">
            <Sparkles size={13} className="text-amber-300" />
            <span>FUOYE Smart Space Portal</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            Welcome back, {firstName}! <Hand className="inline-block text-amber-300" size={26} />
          </h2>
          <p className="text-emerald-100 text-sm mt-2 max-w-lg leading-relaxed">
            Reserve lecture halls, check hostel room availability, and manage your campus space allocations seamlessly.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link
              to="/classroom"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold text-emerald-950 bg-emerald-300 hover:bg-emerald-200 transition-all shadow-md active:scale-95"
            >
              <BookOpen size={16} />
              Book a Space
            </Link>
            <Link
              to="/bookings"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm border border-white/10 transition-all active:scale-95"
            >
              <CalendarCheck size={16} />
              My Bookings
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, sub, icon: Icon, iconColor, iconBg, trend }) => (
          <div
            key={label}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80 hover:shadow-md hover:border-emerald-100 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                style={{ backgroundColor: iconBg }}
              >
                <Icon size={22} style={{ color: iconColor }} />
              </div>
              {trend && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  <TrendingUp size={11} />
                  Active
                </span>
              )}
            </div>
            <p className="text-3xl font-extrabold text-gray-800 mt-4 leading-none">{value}</p>
            <p className="text-xs font-semibold text-gray-600 mt-1.5">{label}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Quick actions */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-800">Quick Actions</h3>
            <p className="text-xs text-gray-400 mt-0.5">Instant access to primary tasks</p>
          </div>
          <div className="space-y-3">
            {quickActions.map(({ label, description, path, icon: Icon, color, bg }) => (
              <Link
                key={path}
                to={path}
                className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all group bg-gray-50/50 hover:bg-white"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: bg }}
                  >
                    <Icon size={20} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 group-hover:text-emerald-800 transition-colors">
                      {label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{description}</p>
                  </div>
                </div>
                <ArrowRight
                  size={16}
                  className="text-gray-300 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all"
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-800">Recent Activity</h3>
              <p className="text-xs text-gray-400 mt-0.5">Latest updates on your requests</p>
            </div>
            <Link
              to="/bookings"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors hover:underline"
            >
              View all
            </Link>
          </div>

          {activity.length > 0 ? (
            <div className="space-y-3 flex-1">
              {activity.map(({ id, text, type, time }) => (
                <div
                  key={id}
                  className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all ${activityBg[type]}`}
                >
                  {activityIcons[type]}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 leading-relaxed">{text}</p>
                    <p className="text-[10px] font-semibold text-gray-400 mt-1">{time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
                <CalendarCheck size={22} />
              </div>
              <p className="text-xs font-semibold text-gray-600">No activity recorded yet</p>
              <p className="text-[11px] text-gray-400 mt-1 max-w-xs">
                Your space reservations and booking status updates will show up right here.
              </p>
              <Link
                to="/classroom"
                className="text-xs font-bold text-emerald-700 hover:underline mt-3 inline-block"
              >
                Make your first booking &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

