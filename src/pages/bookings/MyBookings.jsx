import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  Clock,
  Users,
  BookOpen,
  Plus,
} from 'lucide-react'
import { Card, Badge, Button, EmptyState } from '../../components/common'
import { api } from '../../services/api'

export function timeAgo(isoStr) {
  if (!isoStr) return ''
  try {
    const ms = Date.now() - new Date(isoStr).getTime()
    if (isNaN(ms)) return ''

    const mins = Math.floor(ms / 60000)
    const hours = Math.floor(ms / 3600000)
    const days = Math.floor(ms / 86400000)

    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`

    return new Date(isoStr).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
    })
  } catch {
    return ''
  }
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    const raw = String(dateStr)
    const d = new Date(raw.includes('T') ? raw : raw + 'T00:00:00')
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-NG', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

const STATUS_CONFIG = {
  confirmed:  { variant: 'success', label: 'Confirmed' },
  pending:    { variant: 'warning', label: 'Pending' },
  completed:  { variant: 'neutral', label: 'Completed' },
  cancelled:  { variant: 'danger',  label: 'Cancelled' },
}

const TABS = [
  { label: 'All',       value: 'all' },
  { label: 'Upcoming',  value: 'confirmed' },
  { label: 'Pending',   value: 'pending' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

function canCancel(b) {
  return b.status === 'PENDING' || b.status === 'CONFIRMED'
}

export default function MyBookings() {
  const [bookings, setBookings]         = useState([])
  const [activeTab, setActiveTab]       = useState('all')
  const [cancellingId, setCancellingId] = useState(null)

  const loadBookings = useCallback(async () => {
    const data = await api.getMyBookings()
    if (data) {
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setBookings(data)
    }
  }, [])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  async function handleCancel(id) {
    setCancellingId(id)
    const success = await api.cancelBooking(id)
    setCancellingId(null)
    if (success) {
      loadBookings()
    }
  }

  const [selectedPass, setSelectedPass] = useState(null)

  const filtered =
    activeTab === 'all'
      ? bookings
      : bookings.filter((b) => b.status === activeTab.toUpperCase())

  const tabCount = (val) =>
    val === 'all' ? bookings.length : bookings.filter((b) => b.status === val.toUpperCase()).length

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">My Bookings & Passes</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Track and manage your room rentals, inspections, and digital allocation passes
          </p>
        </div>
        <Link to="/hostel">
          <Button icon={Plus} size="sm">Browse Hostels</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {TABS.map(({ label, value }) => {
          const count    = tabCount(value)
          const isActive = activeTab === value
          return (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
              style={
                isActive
                  ? { backgroundColor: '#0B5D1E', color: '#fff', borderColor: '#0B5D1E' }
                  : { backgroundColor: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }
              }
            >
              {label}
              <span
                className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                style={
                  isActive
                    ? { backgroundColor: 'rgba(255,255,255,0.25)', color: '#fff' }
                    : { backgroundColor: '#f3f4f6', color: '#9ca3af' }
                }
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Booking list */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onCancel={handleCancel}
              onViewPass={(pass) => setSelectedPass(pass)}
              cancellingId={cancellingId}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <EmptyState
            icon={BookOpen}
            title={
              activeTab === 'all'
                ? 'No bookings yet'
                : `No ${TABS.find((t) => t.value === activeTab)?.label.toLowerCase()} bookings`
            }
            description={
              activeTab === 'all'
                ? 'You have not made any room reservations. Browse hostel listings to schedule an inspection.'
                : 'No bookings in this category at the moment.'
            }
            action={
              activeTab === 'all' ? (
                <Link to="/hostel">
                  <Button icon={Plus}>Find a Hostel Room</Button>
                </Link>
              ) : null
            }
          />
        </div>
      )}

      {/* Digital Pass Modal */}
      {selectedPass && (
        <PassModal booking={selectedPass} onClose={() => setSelectedPass(null)} />
      )}
    </div>
  )
}

function BookingCard({ booking: b, onCancel, onViewPass, cancellingId }) {
  const statusKey = (b.status || 'confirmed').toLowerCase()
  const { variant, label } = STATUS_CONFIG[statusKey] ?? { variant: 'success', label: b.status || 'Confirmed' }
  const isCancelling = cancellingId === b.id

  const code = b.room?.roomNumber || b.roomCode || 'RM'
  const name = b.facility?.name || b.roomName || `Hostel Room ${code}`

  return (
    <Card className="hover:shadow-md transition-shadow">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-black leading-none"
            style={{
              background: 'linear-gradient(135deg, #0B5D1E 0%, #1a7a2e 100%)',
              fontSize: code.length > 3 ? '9px' : '11px',
            }}
          >
            {code}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate">{name}</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {b.requiresInspection
                ? `📅 Physical Inspection: ${formatDate(b.inspectionDate || b.startTime)}`
                : '⚡ Direct Room Reservation'}
            </p>
          </div>
        </div>
        <Badge variant={variant} dot className="flex-shrink-0">{label}</Badge>
      </div>

      {/* Details row */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <CalendarDays size={12} className="text-gray-400 flex-shrink-0" />
          Submitted {formatDate(b.createdAt)}
        </span>

        <div className="ml-auto flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewPass(b)}
          >
            View Slip / Pass
          </Button>
          {canCancel(b) && (
            <Button
              size="sm"
              variant="danger"
              loading={isCancelling}
              onClick={() => onCancel(b.id)}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

function PassModal({ booking: b, onClose }) {
  const code = b.room?.roomNumber || 'RM'
  const name = b.facility?.name || 'FUOYE Hostel'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100">
        {/* Pass Header */}
        <div className="p-5 text-white bg-gradient-to-r from-emerald-800 to-green-700 text-center relative">
          <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-200">FUOYE Smart Campus Portal</p>
          <h3 className="text-lg font-extrabold mt-1">{name}</h3>
          <p className="text-xs text-emerald-100 mt-0.5">Room Allocation & Inspection Pass</p>
        </div>

        {/* Pass Body */}
        <div className="p-5 space-y-3.5">
          <div className="flex justify-between items-center py-2 border-b border-gray-100 text-xs">
            <span className="text-gray-400">Pass Status</span>
            <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              {b.status}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-100 text-xs">
            <span className="text-gray-400">Room Number</span>
            <span className="font-bold text-gray-800">Room {code}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-100 text-xs">
            <span className="text-gray-400">Inspection Type</span>
            <span className="font-bold text-gray-800">
              {b.requiresInspection ? 'Option A: Physical Inspection' : 'Direct Booking'}
            </span>
          </div>

          {b.inspectionDate && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100 text-xs">
              <span className="text-gray-400">Inspection Date</span>
              <span className="font-bold text-gray-800">{formatDate(b.inspectionDate)}</span>
            </div>
          )}

          <div className="flex justify-between items-center py-2 border-b border-gray-100 text-xs">
            <span className="text-gray-400">Pass Reference</span>
            <span className="font-mono font-semibold text-gray-600">{b.id?.slice(0, 8).toUpperCase()}</span>
          </div>

          {/* Action buttons */}
          <div className="pt-2">
            <Button fullWidth variant="outline" onClick={onClose}>
              Close Pass
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
