import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  SlidersHorizontal,
  BookOpen,
  X,
  CalendarDays,
  CheckCircle2,
  CalendarCheck,
} from 'lucide-react'
import { Button, Input, Card, Badge, EmptyState, Spinner } from '../../components/common'
import RoomCard from '../../components/cards/RoomCard'
import { api } from '../../services/api'
import { cn } from '../../utils/cn'

const STATUS_FILTERS = [
  { label: 'All Rooms',   value: 'all' },
  { label: 'Available',   value: 'available' },
  { label: 'Booked',      value: 'booked' },
]

const TIME_SLOTS = [
  '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
  '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM',
]

const DURATIONS = [
  { label: '1 Hour',  value: '1' },
  { label: '2 Hours', value: '2' },
  { label: '3 Hours', value: '3' },
  { label: '4 Hours', value: '4' },
]

const EMPTY_FORM = { purpose: '', date: '', startTime: '', duration: '1', attendees: '' }

const selectClass = (hasError = false) => cn(
  'w-full h-[42px] px-4 rounded-xl border text-sm text-gray-600 outline-none transition-all duration-200',
  hasError
    ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
    : 'border-gray-200 bg-gray-50 focus:border-[#0B5D1E] focus:ring-2 focus:ring-[#0B5D1E]/20 focus:bg-white',
)

export default function ClassroomBooking() {
  const navigate = useNavigate()

  const [pageLoading, setPageLoading] = useState(true)
  const [rooms, setRooms]             = useState([])
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [facultyFilter, setFacultyFilter] = useState('all')

  const [selectedRoom, setSelectedRoom] = useState(null)
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [errors, setErrors]             = useState({})
  const [submitting, setSubmitting]     = useState(false)
  const [success, setSuccess]           = useState(false)

  useEffect(() => {
    async function load() {
      const data = await api.getClassrooms()
      if (data) {
        const mapped = data.map(c => {
          const isOccupied = c.rooms?.some(r => r.isOccupied)
          return {
            id: c.id,
            roomId: c.rooms?.[0]?.id,
            code: c.slug.substring(0, 6).toUpperCase(),
            name: c.name,
            faculty: c.location,
            building: c.location,
            capacity: c.capacity,
            features: c.amenities,
            status: isOccupied ? 'booked' : 'available',
            available: !isOccupied
          }
        })
        setRooms(mapped)
      }
      setPageLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedRoom) return
    const handler = (e) => { if (e.key === 'Escape') closeModal() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedRoom])

  // Derived values
  const faculties      = ['all', ...new Set(rooms.map((r) => r.faculty))]
  const availableCount = rooms.filter((r) => r.status === 'available').length
  const bookedCount    = rooms.filter((r) => r.status === 'booked').length
  const maintCount     = rooms.filter((r) => r.status === 'maintenance').length

  const filtered = rooms.filter((r) => {
    const q = search.toLowerCase()
    const matchSearch =
      r.code.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      r.faculty.toLowerCase().includes(q) ||
      r.building.toLowerCase().includes(q)
    const matchStatus  = statusFilter === 'all'  || r.status  === statusFilter
    const matchFaculty = facultyFilter === 'all' || r.faculty === facultyFilter
    return matchSearch && matchStatus && matchFaculty
  })

  const hasActiveFilters = search || statusFilter !== 'all' || facultyFilter !== 'all'

  function clearFilters() {
    setSearch('')
    setStatusFilter('all')
    setFacultyFilter('all')
  }

  function openModal(room) {
    setSelectedRoom(room)
    setForm(EMPTY_FORM)
    setErrors({})
    setSuccess(false)
  }

  function closeModal() {
    if (submitting) return
    setSelectedRoom(null)
    setSuccess(false)
  }

  function validate() {
    const e = {}
    if (!form.purpose.trim()) e.purpose   = 'Event purpose is required'
    if (!form.date)           e.date      = 'Please select a date'
    if (!form.startTime)      e.startTime = 'Please select a start time'
    if (form.attendees) {
      const n = Number(form.attendees)
      if (!Number.isInteger(n) || n < 1)
        e.attendees = 'Enter a valid number'
      else if (n > selectedRoom.capacity)
        e.attendees = `Exceeds room capacity (${selectedRoom.capacity.toLocaleString()})`
    }
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    
    // Parse times
    const startStr = `${form.date} ${form.startTime}`
    const startObj = new Date(startStr)
    const endObj = new Date(startObj.getTime() + Number(form.duration) * 3600000)

    const bookingData = {
      facilityId: selectedRoom.id,
      roomId: selectedRoom.roomId,
      purpose: form.purpose.trim(),
      startTime: startObj.toISOString(),
      endTime: endObj.toISOString()
    }

    const res = await api.createBooking(bookingData)
    setSubmitting(false)

    if (res?.success) {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === selectedRoom.id ? { ...r, available: false, status: 'booked' } : r,
        ),
      )
      setSuccess(true)
    } else {
      setErrors({ duplicate: res?.message || 'Failed to submit booking.' })
    }
  }

  if (pageLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Spinner size="lg" centered />
        <p className="text-xs text-gray-400">Loading available rooms…</p>
      </div>
    )
  }

  // ── Page ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-6xl mx-auto">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Classroom Booking</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Browse and reserve lecture halls and auditoriums across FUOYE
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold flex-wrap">
          <span className="flex items-center gap-1.5 text-green-600">
            <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            {availableCount} Available
          </span>
          <span className="flex items-center gap-1.5 text-amber-600">
            <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
            {bookedCount} Booked
          </span>
          <span className="flex items-center gap-1.5 text-red-500">
            <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
            {maintCount} Maintenance
          </span>
        </div>
      </div>

      {/* ── Search + filters ── */}
      <Card noPadding bodyClassName="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by room name, code, building, or faculty…"
              leftIcon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={facultyFilter}
            onChange={(e) => setFacultyFilter(e.target.value)}
            className={cn(selectClass(), 'sm:w-52 cursor-pointer')}
          >
            {faculties.map((f) => (
              <option key={f} value={f}>
                {f === 'all' ? 'All Faculties' : f}
              </option>
            ))}
          </select>
        </div>

        {/* Status chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal size={13} className="text-gray-400 flex-shrink-0" />
          {STATUS_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={cn(
                'px-3 py-1 rounded-full text-[11px] font-semibold transition-all border',
                statusFilter === value
                  ? 'text-white border-transparent'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300',
              )}
              style={
                statusFilter === value
                  ? { backgroundColor: '#0B5D1E', borderColor: '#0B5D1E' }
                  : {}
              }
            >
              {label}
            </button>
          ))}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={11} />
              Clear
            </button>
          )}
        </div>
      </Card>

      {/* ── Results count ── */}
      <p className="text-xs text-gray-400 font-medium px-0.5">
        Showing{' '}
        <span className="text-gray-600 font-semibold">{filtered.length}</span>
        {' '}of{' '}
        <span className="text-gray-600 font-semibold">{rooms.length}</span>
        {' '}rooms
        {hasActiveFilters && ' matching your filters'}
      </p>

      {/* ── Room grid / empty state ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((room) => (
            <RoomCard key={room.id} room={room} onBook={openModal} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <EmptyState
            icon={BookOpen}
            title="No rooms found"
            description="No rooms match your current filters. Try adjusting the search term or clearing the filters."
            action={
              hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear all filters
                </Button>
              ) : null
            }
          />
        </div>
      )}

      {/* ── Booking modal ── */}
      {selectedRoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            {/* Modal header */}
            <div className="flex items-start justify-between p-5 border-b border-gray-100">
              <div className="min-w-0 pr-3">
                <h2 className="text-base font-bold text-gray-800 leading-snug">
                  {success ? 'Booking Submitted!' : `Book ${selectedRoom.name}`}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {success
                    ? 'Your request is pending admin approval.'
                    : selectedRoom.faculty}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* ── Success state ── */}
            {success ? (
              <div className="p-5 flex flex-col items-center text-center py-8">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: '#e8f5e9' }}
                >
                  <CheckCircle2 size={32} style={{ color: '#0B5D1E' }} />
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">
                  Request Submitted
                </h3>
                <p className="text-xs text-gray-400 max-w-xs leading-relaxed mb-1">
                  Your booking for{' '}
                  <strong className="text-gray-600">{selectedRoom.name}</strong>{' '}
                  on{' '}
                  <strong className="text-gray-600">
                    {new Date(form.date + 'T00:00:00').toLocaleDateString('en-NG', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </strong>{' '}
                  at{' '}
                  <strong className="text-gray-600">{form.startTime}</strong> has been
                  submitted.
                </p>
                <p className="text-[10px] text-gray-400 mb-6">
                  You will be notified once an admin approves your request.
                </p>
                <div className="flex gap-3 w-full">
                  <Button variant="outline" fullWidth onClick={closeModal}>
                    Book Another
                  </Button>
                  <Button
                    fullWidth
                    icon={CalendarCheck}
                    onClick={() => { closeModal(); navigate('/bookings') }}
                  >
                    View Bookings
                  </Button>
                </div>
              </div>
            ) : (
              /* ── Booking form ── */
              <form onSubmit={handleSubmit} className="p-5 space-y-4">

                {/* Room summary chip */}
                <div className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 bg-gray-50">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-black text-xs"
                    style={{ background: 'linear-gradient(135deg, #0B5D1E 0%, #1a7a2e 100%)' }}
                  >
                    {selectedRoom.code.length <= 4
                      ? selectedRoom.code
                      : selectedRoom.code.slice(0, 4)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700 truncate">
                      {selectedRoom.name}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {selectedRoom.building} · {selectedRoom.capacity.toLocaleString()} seats
                    </p>
                  </div>
                  <Badge variant="success" dot>Available</Badge>
                </div>

                {/* Purpose */}
                <Input
                  label="Event / Purpose"
                  placeholder="e.g. CSC 301 Tutorial, Departmental Meeting"
                  required
                  value={form.purpose}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, purpose: e.target.value }))
                    if (errors.purpose) setErrors((er) => ({ ...er, purpose: undefined }))
                  }}
                  error={errors.purpose}
                />

                {/* Date + duration row */}
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Date"
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={form.date}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, date: e.target.value }))
                      if (errors.date) setErrors((er) => ({ ...er, date: undefined }))
                    }}
                    error={errors.date}
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-600 select-none">
                      Duration <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={form.duration}
                      onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                      className={selectClass()}
                    >
                      {DURATIONS.map(({ label, value }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Start time */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 select-none">
                    Start Time <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.startTime}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, startTime: e.target.value }))
                      if (errors.startTime) setErrors((er) => ({ ...er, startTime: undefined }))
                    }}
                    className={selectClass(!!errors.startTime)}
                  >
                    <option value="">Select start time…</option>
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {errors.startTime && (
                    <p className="text-red-500 text-[11px] leading-snug">{errors.startTime}</p>
                  )}
                </div>

                {/* Attendees */}
                <Input
                  label="Number of Attendees"
                  type="number"
                  placeholder={`Max ${selectedRoom.capacity.toLocaleString()}`}
                  min="1"
                  max={selectedRoom.capacity}
                  value={form.attendees}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, attendees: e.target.value }))
                    if (errors.attendees) setErrors((er) => ({ ...er, attendees: undefined }))
                  }}
                  error={errors.attendees}
                  hint={`This room holds up to ${selectedRoom.capacity.toLocaleString()} people`}
                />

                {/* Duplicate booking error */}
                {errors.duplicate && (
                  <div className="p-3 rounded-xl border border-red-100 bg-red-50">
                    <p className="text-red-600 text-xs leading-snug">{errors.duplicate}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    disabled={submitting}
                    onClick={closeModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    fullWidth
                    icon={CalendarDays}
                    loading={submitting}
                  >
                    Confirm Booking
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
